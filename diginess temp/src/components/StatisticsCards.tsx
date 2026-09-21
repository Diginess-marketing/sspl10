import { Trophy, MapPin, Users, Globe } from 'lucide-react';

interface StatisticsCardsProps {
  className?: string;
}

const StatisticsCards = ({ className = '' }: StatisticsCardsProps) => {
  const stats = [
    {
      icon: Trophy,
      label: 'Prize Money',
      value: 'upto 3 Crores',
      bgColor: 'bg-orange-600',
      iconColor: 'text-yellow-300',
    },
    {
      icon: Users,
      label: 'Player Prize',
      value: 'upto 3 Lakhs',
      bgColor: 'bg-blue-600',
      iconColor: 'text-blue-200',
    },
    {
      icon: MapPin,
      label: 'Final At',
      value: 'Sharjah',
      bgColor: 'bg-purple-600',
      iconColor: 'text-purple-200',
    },
    {
      icon: Globe,
      label: 'States',
      value: '6',
      bgColor: 'bg-green-600',
      iconColor: 'text-green-200',
    },
    {
      icon: Users,
      label: 'Teams',
      value: '12',
      bgColor: 'bg-red-600',
      iconColor: 'text-red-200',
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
          <div className="flex flex-col items-center space-y-2 text-center">
            <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
            <div className="text-sm font-semibold font-body text-white">{stat.label}</div>
            <div className="text-2xl font-bold font-numbers text-white">{stat.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;