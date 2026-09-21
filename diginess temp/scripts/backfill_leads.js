import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials in .env file')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// File paths
const paidRegsFile = path.join(rootDir, 'admin/react-app/src/Paid_registrations.json')
const playersDataFile = path.join(rootDir, 'Players Data.json')

async function backfill() {
    console.log('Starting backfill...')

    let importedCount = 0
    const contacts = new Map() // Use Map to dedupe by phone/email

    // 1. Process Paid Registrations
    if (fs.existsSync(paidRegsFile)) {
        console.log('Reading Paid_registrations.json...')
        const data = JSON.parse(fs.readFileSync(paidRegsFile, 'utf8'))
        data.forEach(row => {
            const email = row['Mail ID']
            const phone = row['Phone Number']?.replace(/^\+91/, '') // Normalize phone

            if (email || phone) {
                const key = phone || email
                if (!contacts.has(key)) {
                    contacts.set(key, {
                        email,
                        phone,
                        name: null, // Paid regs doesn't seem to have name in the snippet I saw
                        utm_source: 'import_paid_regs',
                        created_at: new Date().toISOString()
                    })
                }
            }
        })
    } else {
        console.warn('Paid_registrations.json not found')
    }

    // 2. Process Players Data
    if (fs.existsSync(playersDataFile)) {
        console.log('Reading Players Data.json...')
        const data = JSON.parse(fs.readFileSync(playersDataFile, 'utf8'))
        data.forEach(row => {
            const phone = row.mobile
            const name = row.name
            const email = row.email // Might be undefined based on snippet

            if (phone) {
                // If we already have this phone from paid regs, update name if missing
                if (contacts.has(phone)) {
                    const existing = contacts.get(phone)
                    if (!existing.name && name) existing.name = name
                } else {
                    contacts.set(phone, {
                        email: email || null,
                        phone,
                        name,
                        utm_source: 'import_players_data',
                        created_at: new Date().toISOString()
                    })
                }
            }
        })
    } else {
        console.warn('Players Data.json not found')
    }

    console.log(`Found ${contacts.size} unique contacts to import.`)

    // 3. Batch Insert
    const batchSize = 100
    const leads = Array.from(contacts.values())

    for (let i = 0; i < leads.length; i += batchSize) {
        const batch = leads.slice(i, i + batchSize)
        const { error } = await supabase.from('visitor_leads').insert(batch)

        if (error) {
            console.error('Error inserting batch:', error)
        } else {
            importedCount += batch.length
            console.log(`Imported ${importedCount} / ${leads.length}`)
        }
    }

    console.log('Backfill complete.')
}

backfill().catch(console.error)
