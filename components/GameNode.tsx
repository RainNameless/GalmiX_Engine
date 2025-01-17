import React from 'react';
import { Handle, Position } from 'reactflow';
import Image from 'next/image';

interface GameNodeProps {
  data: {
    id: number;
    text: string;
    choices: { text: string; nextId: number }[];
    image?: string;
    layout?: 'vertical' | 'horizontal';
  };
}

export function GameNode({ data }: GameNodeProps) {
  const isHorizontal = data.layout === 'horizontal';

  return (
    <div className="p-4 border rounded-lg bg-white shadow-lg min-w-[200px] max-w-[400px] cursor-move">
      <Handle
        type="target"
        position={isHorizontal ? Position.Left : Position.Top}
        className={isHorizontal ? 'left-[-8px]' : 'top-[-8px]'}
      />
      <div className="text-lg font-bold mb-2">节点 {data.id}</div>
      {data.image && (
        <div className="mb-4">
          <Image src={data.image} alt="节点图片" width={200} height={200} objectFit="cover" />
        </div>
      )}
      <p className="text-sm mb-4 break-words whitespace-pre-wrap">{data.text}</p>
      <div className="space-y-2">
        {data.choices.map((choice, index) => (
          <div key={index} className="text-xs p-2 bg-gray-100 rounded">
            {choice.text} (→ {choice.nextId})
          </div>
        ))}
      </div>
      <Handle
        type="source"
        position={isHorizontal ? Position.Right : Position.Bottom}
        className={isHorizontal ? 'right-[-8px]' : 'bottom-[-8px]'}
      />
    </div>
  );
}

