import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ImportNodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (nodeData: string) => void;
}

export function ImportNodeDialog({ isOpen, onClose, onImport }: ImportNodeDialogProps) {
  const [nodeData, setNodeData] = useState('');

  const handleImport = () => {
    onImport(nodeData);
    setNodeData('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>导入节点</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="node-data">节点数据 (JSON格式)</Label>
            <Textarea
              id="node-data"
              value={nodeData}
              onChange={(e) => setNodeData(e.target.value)}
              className="h-64"
              placeholder='{"text": "节点文本", "choices": [{"text": "选项1"}, {"text": "选项2"}]}'
            />
          </div>
          <Button onClick={handleImport}>导入</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

