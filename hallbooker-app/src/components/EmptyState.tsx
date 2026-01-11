
import { Bell } from 'lucide-react';

interface EmptyStateProps {
  message: string;
}

const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <div className="text-center py-20 px-4">
      <div className="flex justify-center items-center w-24 h-24 mx-auto bg-gray-100 rounded-full">
        <Bell className="w-12 h-12 text-gray-400" />
      </div>
      <p className="mt-6 text-xl font-semibold text-gray-600">{message}</p>
      <p className="mt-2 text-md text-gray-500">When you get new notifications, they will appear here.</p>
    </div>
  );
};

export default EmptyState;
