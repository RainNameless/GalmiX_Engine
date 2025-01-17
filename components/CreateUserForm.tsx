import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export const CreateUserForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const { createUser } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser(password, isAdmin);
    setPassword('');
    setIsAdmin(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="new-password">新用户密码</Label>
        <Input
          id="new-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is-admin"
          checked={isAdmin}
          onCheckedChange={(checked) => setIsAdmin(checked as boolean)}
        />
        <Label htmlFor="is-admin">管理员权限</Label>
      </div>
      <Button type="submit">创建用户</Button>
    </form>
  );
};

