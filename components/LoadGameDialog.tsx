import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LoadGameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (url: string) => Promise<void>;
}

export const LoadGameDialog: React.FC<LoadGameDialogProps> = ({ isOpen, onClose, onLoad }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoad = async () => {
    if (url.trim()) {
      setIsLoading(true);
      try {
        await onLoad(url.trim());
        setUrl('');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>加载存档</DialogTitle>
          <DialogDescription>
            请输入存档链接以加载游戏数据
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="请输入存档链接"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleLoad} disabled={isLoading}>
            {isLoading ? '加载中...' : '加载'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

