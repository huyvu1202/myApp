import React from "react";
import { Card, Radio, Button, Typography, message } from "antd";

const { Title, Text } = Typography;

interface QuestionProps {
  question: {
    id: number;
    question: string;
    options: string[];
    answer: string;
  };
  current: number;
  total: number;
  selected: string | null;
  onSelect: (value: string) => void;
  onNext: () => void;
}

const Question: React.FC<QuestionProps> = ({
  question,
  current,
  total,
  selected,
  onSelect,
  onNext,
}) => {
  const handleNext = () => {
    if (selected === null) {
      message.warning("Please select an answer");
      return;
    }
    onNext();
  };

  return (
    <Card>
      <Title level={4}>
        Question {current + 1} / {total}
      </Title>
      <Text strong>{question.question}</Text>
      <Radio.Group
        onChange={(e) => onSelect(e.target.value)}
        value={selected}
        style={{ display: "block", marginTop: 20 }}
      >
        {question.options.map((opt) => (
          <Radio key={opt} value={opt} style={{ display: "block", margin: "8px 0" }}>
            {opt}
          </Radio>
        ))}
      </Radio.Group>
      <Button type="primary" onClick={handleNext} style={{ marginTop: 20 }}>
        Continue
      </Button>
    </Card>
  );
};

export default Question;