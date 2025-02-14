import { LucideIcon } from 'lucide-react';

interface InfoCardProps {
    icon: LucideIcon;
    label: string;
    value: string;
}

export const InfoCard = ({ icon: Icon, label, value }: InfoCardProps) => {
    return (
        <div className="p-4 rounded-lg bg-gray-800/40 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200">
            <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className="text-purple-400" />
                <span className="text-sm text-purple-300">{label}</span>
            </div>
            <div className="text-white font-mono max-w-[500px] truncate">{value.charAt(0).toUpperCase() + value.slice(1)}</div>
        </div>
    );
};
