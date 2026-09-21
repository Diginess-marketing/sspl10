import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { SSPLStanding } from '@/types/sspl';

interface PointsTableProps {
  standings: SSPLStanding[];
}

const TEAM_META: Record<string, { name: string; logo?: string }> = {
  tn: { name: 'Tamil Nadu', logo: '/Explore the teams/Tamil Nadu.png' },
  ka: { name: 'Karnataka', logo: '/Explore the teams/Karnataka.png' },
  ke: { name: 'Kerala', logo: '/Explore the teams/Kerala.png' },
  ts: { name: 'Telangana', logo: '/Explore the teams/Telangana.png' },
  ap: { name: 'Andhra Pradesh', logo: '/Explore the teams/Andra Pradesh.png' },
  py: { name: 'Puducherry', logo: '/Explore the teams/Pudhucherry.png' },
};

const PointsTable: React.FC<PointsTableProps> = ({ standings }) => {
  const rows = [...standings].sort((a, b) => a.position - b.position);

  return (
    <div className="w-full">
      <Table aria-label="Tournament points table">
        <TableCaption>SSPL T10 Standings - Season 2025</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Pos</TableHead>
            <TableHead scope="col">Team</TableHead>
            <TableHead scope="col" className="text-right">P</TableHead>
            <TableHead scope="col" className="text-right">W</TableHead>
            <TableHead scope="col" className="text-right">L</TableHead>
            <TableHead scope="col" className="text-right">Pts</TableHead>
            <TableHead scope="col" className="text-right">NRR</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((s) => {
            const meta = TEAM_META[s.team_id] || { name: s.team_id.toUpperCase() };
            return (
              <TableRow key={s.id}>
                <TableCell aria-label="Position">{s.position}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {meta.logo ? (
                      <img src={meta.logo} alt="" className="w-6 h-6 rounded-full" loading="lazy" />
                    ) : null}
                    <span className="font-medium text-white">{meta.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{s.matches_played}</TableCell>
                <TableCell className="text-right">{s.wins}</TableCell>
                <TableCell className="text-right">{s.losses}</TableCell>
                <TableCell className="text-right font-semibold">{s.points}</TableCell>
                <TableCell className="text-right">{s.net_run_rate.toFixed(2)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default PointsTable;
