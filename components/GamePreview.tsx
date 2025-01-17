import React from 'react';
import { Button } from "@/components/ui/button"
import { Node } from '../data/storyData';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './ErrorFallback';
import Image from 'next/image';

interface GamePreviewProps {
  currentScenario: Node | null;
  onChoiceClick: (nextId: number | null) => void;
}

export const GamePreview: React.FC<GamePreviewProps> = ({ currentScenario, onChoiceClick }) => {

  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          componentName="GamePreview"
        />
      )}
    >
      <div className="fixed inset-0 flex flex-col bg-white md:static md:h-full md:flex md:items-center md:justify-center md:p-4">
        {currentScenario ? (
          <div className="bg-white md:p-8 md:rounded-lg md:shadow-lg md:max-w-2xl w-full h-full md:h-auto md:max-h-[80vh] overflow-y-auto flex flex-col">
            <div className="w-full flex-1 overflow-y-auto">
              <div className="p-4 md:p-8">
                <p className="text-lg mb-4 md:mb-8 whitespace-pre-wrap leading-relaxed p-4 md:p-0">
                  {currentScenario.text}
                </p>
                {currentScenario.image && (
                  <div className="mb-4 md:mb-8 flex justify-center">
                    <div className="relative w-full aspect-[4/3] md:h-[40vh]">
                      <Image 
                        src={currentScenario.image} 
                        alt="场景图片" 
                        layout="fill"
                        objectFit="contain"
                        className="rounded-md"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4 p-4 md:p-0 mt-auto">
              {currentScenario.choices.map((choice, index) => (
                <Button
                  key={index}
                  onClick={() => onChoiceClick(choice.nextId)}
                  className="w-full text-base py-4 h-auto whitespace-normal bg-black hover:bg-gray-800 text-white"
                >
                  {choice.text}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-4">
              <p className="text-xl font-semibold">加载中...</p>
              <p className="text-gray-500 mt-2">如果长时���未加载,请检查游戏数据是否正确。</p>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

