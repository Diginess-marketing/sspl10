import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, CardGrid } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FixtureCard, Team } from "@/components/FixtureCard"
import { TeamCard } from "@/components/TeamCard"
import { NewsCard } from "@/components/NewsCard"
import { StatsCard } from "@/components/StatsCard"
import { CardSkeleton } from "@/components/CardSkeleton"
import { OptimizedImage } from "@/components/OptimizedImage"

const CardSystemExamples = () => {
  // Sample data
  const sampleTeams: Team[] = [
    {
      name: "Mumbai Indians",
      logo: "/placeholder.svg",
      abbreviation: "MI",
      players: 25,
      captain: "Rohit Sharma",
      coach: "Mark Boucher",
      founded: "2008",
      achievements: ["5x IPL Champions", "2x CLT20 Winners"]
    },
    {
      name: "Chennai Super Kings",
      logo: "/placeholder.svg",
      abbreviation: "CSK",
      players: 24,
      captain: "MS Dhoni",
      coach: "Stephen Fleming",
      founded: "2008",
      achievements: ["4x IPL Champions", "Most Consistent Team"]
    }
  ]

  const sampleFixture = {
    homeTeam: sampleTeams[0],
    awayTeam: sampleTeams[1],
    date: "2024-04-15",
    time: "19:30",
    venue: "Wankhede Stadium, Mumbai",
    status: "upcoming" as const
  }

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">SSPLT10 Card System</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A comprehensive card component system with consistent styling, accessibility features,
          and optimized performance for the SSPLT10 cricket platform.
        </p>
      </div>

      {/* Base Card Components */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Base Card Components</h2>
        <CardGrid variant="3" gap="lg">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Standard card with consistent styling</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card uses the design system tokens for consistent spacing, typography, and colors.</p>
            </CardContent>
            <CardFooter>
              <Button>Action</Button>
            </CardFooter>
          </Card>

          <Card variant="stats">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">1,234</div>
              <p className="text-sm text-muted-foreground">Total users</p>
            </CardContent>
          </Card>

          <Card clickable ariaLabel="Interactive card example">
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
              <CardDescription>Click or press Enter to interact</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card supports keyboard navigation and screen readers.</p>
            </CardContent>
          </Card>
        </CardGrid>
      </section>

      {/* Fixture Cards */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Fixture Cards</h2>
        <CardGrid variant="fixture" gap="md">
          <FixtureCard {...sampleFixture} />
          <FixtureCard
            {...sampleFixture}
            status="live"
            score={{ home: 45, away: 32 }}
          />
          <FixtureCard
            {...sampleFixture}
            status="completed"
            score={{ home: 187, away: 165 }}
          />
        </CardGrid>
      </section>

      {/* Team Cards */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Team Cards</h2>
        <CardGrid variant="team" gap="md">
          {sampleTeams.map((team, index) => (
            <TeamCard
              key={index}
              {...team}
              stats={{
                matches: 14,
                wins: 8,
                losses: 6,
                winRate: 57
              }}
            />
          ))}
        </CardGrid>
      </section>

      {/* News Cards */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">News Cards</h2>
        <CardGrid variant="news" gap="lg">
          <NewsCard
            title="Breaking: New Player Joins SSPLT10"
            excerpt="Exciting news from the tournament as a star player announces participation in the upcoming season..."
            thumbnail="/placeholder.svg"
            author="Sports Desk"
            publishedAt="2024-01-15T10:30:00Z"
            readTime={3}
            category="Breaking News"
            tags={["Transfer", "Player News", "SSPLT10"]}
            onReadMore={() => console.log('Read more')}
          />

          <NewsCard
            title="Match Preview: Mumbai vs Chennai"
            excerpt="A detailed preview of the upcoming blockbuster match between two of the most successful teams..."
            thumbnail="/placeholder.svg"
            author="Cricket Analyst"
            publishedAt="2024-01-14T15:45:00Z"
            readTime={5}
            category="Match Preview"
            tags={["Preview", "Mumbai", "Chennai"]}
          />
        </CardGrid>
      </section>

      {/* Stats Cards */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Statistics Cards</h2>
        <CardGrid variant="stats" gap="sm">
          <StatsCard
            title="Total Matches"
            value={156}
            description="Completed matches this season"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>}
            trend={{ value: 12, isPositive: true, label: "vs last month" }}
            format="number"
          />

          <StatsCard
            title="Total Revenue"
            value={2847500}
            description="Generated this season"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>}
            trend={{ value: 8, isPositive: true, label: "vs last month" }}
            format="currency"
          />

          <StatsCard
            title="Win Rate"
            value={68.5}
            description="Average across all teams"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>}
            trend={{ value: 3.2, isPositive: true, label: "improvement" }}
            format="percentage"
          />

          <StatsCard
            title="Active Users"
            value={1247}
            description="Currently online"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>}
            trend={{ value: 15, isPositive: false, label: "vs yesterday" }}
            format="number"
          />
        </CardGrid>
      </section>

      {/* Loading States */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Loading States</h2>
        <CardGrid variant="3" gap="md">
          <CardSkeleton variant="fixture" showImage />
          <CardSkeleton variant="team" />
          <CardSkeleton variant="news" showImage />
        </CardGrid>
      </section>

      {/* Responsive Grid Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Responsive Grid Layouts</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Single Column (Mobile-first)</h3>
            <CardGrid variant="1" gap="md">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>Card {i + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>This layout stacks vertically on all screen sizes.</p>
                  </CardContent>
                </Card>
              ))}
            </CardGrid>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Two Column Grid</h3>
            <CardGrid variant="2" gap="md">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>Card {i + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Responsive grid that shows 1 column on mobile, 2 on larger screens.</p>
                  </CardContent>
                </Card>
              ))}
            </CardGrid>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Four Column Grid</h3>
            <CardGrid variant="4" gap="sm">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} variant="stats">
                  <CardHeader>
                    <CardTitle>Stat {i + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.floor(Math.random() * 1000)}</div>
                  </CardContent>
                </Card>
              ))}
            </CardGrid>
          </div>
        </div>
      </section>

      {/* Optimized Images */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Optimized Images</h2>
        <CardGrid variant="3" gap="lg">
          <Card>
            <CardContent className="p-0">
              <OptimizedImage
                src="/placeholder.svg"
                alt="Sample cricket match"
                aspectRatio="video"
                className="rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">Optimized Loading</h3>
                <p className="text-sm text-muted-foreground">
                  Images load progressively with fallbacks and proper aspect ratios.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <OptimizedImage
                src="/placeholder.svg"
                alt="Team logo"
                aspectRatio="square"
                className="rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">Square Aspect Ratio</h3>
                <p className="text-sm text-muted-foreground">
                  Perfect for logos and profile pictures.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <OptimizedImage
                src="/placeholder.svg"
                alt="Player portrait"
                aspectRatio="portrait"
                className="rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">Portrait Aspect Ratio</h3>
                <p className="text-sm text-muted-foreground">
                  Ideal for player photos and portraits.
                </p>
              </div>
            </CardContent>
          </Card>
        </CardGrid>
      </section>
    </div>
  )
}

export default CardSystemExamples