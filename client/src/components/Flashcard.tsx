import React, { useState, useEffect, useRef } from "react";
import { Card, Typography, Tag, Button, Space } from "antd";
import { useSwipeable } from "react-swipeable";
import { toHiragana } from "wanakana";
import { Input } from "antd";
import type { InputRef } from "antd";

const { Title, Text, Paragraph } = Typography;

interface FlashcardProps {
  card: Flashcard;
  onNext: () => void;
  onBack: () => void;
}

const convertToHiragana = (text: string) => {
  return toHiragana(text);
};

const FlashCardApp: React.FC<FlashcardProps> = ({ card, onNext, onBack }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [convertedReading, setConvertedReading] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [wrongCount, setWrongCount] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    setShowDetail(false);
    setWrongCount(0);
    setShowHint(false);
    setInputValue("");
    if (card.type === "vocabulary" && !card.reading) {
      const result = convertToHiragana(card.word || "");
      setConvertedReading(result);
    }
  }, [card]);

  const handlers = useSwipeable({
    onSwipedLeft: () => onNext(),
    onSwipedRight: () => onBack(),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const handleTap = () => setShowDetail(!showDetail);

  const correctAnswer = card.word?.toLowerCase().trim();

  const checkAnswer = () => {
    if (!inputValue.trim()) return;

    if (inputValue.toLowerCase().trim() === correctAnswer) {
      // Đáp án đúng
      setShowDetail(true);
      setWrongCount(0);
      setShowHint(false);
      setInputValue("");
      onNext();
    } else {
      // Sai
      const newWrongCount = wrongCount + 1;
      setWrongCount(newWrongCount);
      setShowHint(newWrongCount >= 2);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      checkAnswer();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setShowHint(true);
    }
  };

  return (
    <div
      {...handlers}
      style={{
        touchAction: "pan-y",
        display: "flex",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <Card
        title={
          { vocabulary: "Vocabulary", kanji: "Kanji", sentence: "Sentence" }[
            card.type
          ]
        }
        style={{
          margin: 0,
          fontSize: "14px",
          lineHeight: 1.6,
          width: 300,
          maxWidth: 480,
          height: 450, // tăng height để đủ chỗ input
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
        bodyStyle={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: 16,
        }}
      >
        {/* Tags */}
        {card.tags?.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}

        {/* Card Front */}
        {!showDetail && (
          <>
            {/* Input for user answer (only vocabulary type) */}
            {card.type === "vocabulary" && (
              <Space
                direction="vertical"
                style={{ marginTop: 16, width: "100%" }}
              >
                <Input
                  ref={inputRef}
                  placeholder="Nhập từ đây"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={onKeyDown}
                  autoFocus
                  allowClear
                />
                <Button type="primary" onClick={checkAnswer}>
                  OK
                </Button>
              </Space>
            )}

            {/* Hint (reading and meaning) hiện khi sai >= 2 lần hoặc nhấn mũi tên lên */}
            {showHint && card.type === "vocabulary" && (
              <div style={{ marginTop: 12, fontSize: 14, color: "#999" }}>
                <div>
                  <b>Reading:</b> {card.reading || convertedReading}
                </div>
                <div>
                  <b>Meaning:</b> {card.meaning}
                </div>
              </div>
            )}
          </>
        )}

        {/* Card Back (Details) */}
        {showDetail && (
          <div style={{ fontSize: "14px" }}>
            {card.type === "vocabulary" && (
              <>
                <Title level={4}>{card.word}</Title>
                <Text>{card.reading || convertedReading}</Text>
                <br />
                <Text>{card.meaning}</Text>
                {card.exampleSentence && (
                  <Paragraph style={{ marginTop: 8 }}>
                    <b>Example:</b>
                    <br />
                    {card.exampleSentence.ja}
                    <br />
                    {card.exampleSentence.en && (
                      <>
                        {card.exampleSentence.en}
                        <br />
                      </>
                    )}
                    {card.exampleSentence.vi && <>{card.exampleSentence.vi}</>}
                  </Paragraph>
                )}
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default FlashCardApp;
