import React from 'react';
import { presetsMap } from '../machines/presets';

interface MachineSelectorProps {
  currentMachine: string;
  onMachineChange: (machineKey: string) => void;
}

export const MachineSelector: React.FC<MachineSelectorProps> = ({
  currentMachine,
  onMachineChange
}) => {
  return (
    <div className="flex items-center space-x-3">
      <label className="text-sm font-medium text-gray-700">
        Machine :
      </label>
      <select
        value={currentMachine}
        onChange={(e) => onMachineChange(e.target.value)}
        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      >
        <option value="Test Simple">Test Simple</option>
        {Object.entries(presetsMap).map(([key, preset]) => (
          <option key={key} value={key}>
            {preset.name}
          </option>
        ))}
      </select>
    </div>
  );
};