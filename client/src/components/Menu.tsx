import React from "react";
import { Card, Button } from "antd";

interface MenuProps {
  onStartQuiz: () => void;
}

const Menu: React.FC<MenuProps> = ({ onStartQuiz }) => {
  return (
    <Card title="Welcome" style={{ maxWidth: 400, margin: "40px auto" }}>
      <Button type="primary" onClick={onStartQuiz} block>
        Start Quiz
      </Button>
    </Card>
  );
};

export default Menu;