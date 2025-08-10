import React, { useState, useEffect, useRef } from "react";
import { Card, Typography, Tag, Button, Space, Divider } from "antd";
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

  const correctAnswer =
    card.type === "vocabulary" ? card.word?.toLowerCase().trim() : undefined;

  const checkAnswer = () => {
    if (!inputValue.trim()) return;

    if (inputValue.toLowerCase().trim() === correctAnswer) {
      setShowDetail(true);
      setWrongCount(0);
      setShowHint(false);
      setInputValue("");
      onNext();
    } else {
      const newWrongCount = wrongCount + 1;
      setWrongCount(newWrongCount);
      setShowHint(newWrongCount >= 2);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      checkAnswer();
    } else if (e.ctrlKey && e.code === "Space") {
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
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Card
        title={
          {
            vocabulary: "Vocabulary",
            kanji: "Kanji",
            sentence: "Sentence",
          }[card.type]
        }
        style={{
          width: 360,
          maxWidth: "95vw",
          minHeight: 480,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          borderRadius: 8,
        }}
        bodyStyle={{
          flex: 1,
          padding: "24px 32px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Tags */}
        <div style={{ marginBottom: 12 }}>
          {card.tags?.map((tag) => (
            <Tag key={tag} color="blue" style={{ marginBottom: 4 }}>
              {tag}
            </Tag>
          ))}
        </div>

        {/* Word chính (căn giữa, nổi bật) */}
        <div
          style={{
            flexShrink: 0,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          {card.type === "vocabulary" && (
            <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
              {card.word}
            </Title>
          )}
          {card.type === "kanji" && (
            <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
              {card.kanji}
            </Title>
          )}
          {card.type === "sentence" && (
            <Paragraph
              style={{ fontSize: 16, fontWeight: "bold", marginBottom: 0 }}
            >
              {card.sentence?.ja}
            </Paragraph>
          )}
        </div>

        {/* Nội dung chính */}
        <div
          style={{
            flexGrow: 1,
            overflowY: "auto",
            marginBottom: 12,
          }}
          onClick={handleTap}
        >
          {/* Front */}
          {!showDetail && (
            <>
              {card.type === "vocabulary" && (
                <>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Input
                      ref={inputRef}
                      placeholder="Nhập từ đây và nhấn Enter hoặc OK"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={onKeyDown}
                      allowClear
                      size="large"
                      autoFocus
                    />
                    <Button type="primary" onClick={checkAnswer} block>
                      OK
                    </Button>
                  </Space>

                  {/* Hint */}
                  {showHint && (
                    <div
                      style={{
                        marginTop: 16,
                        padding: 12,
                        backgroundColor: "#fafafa",
                        border: "1px solid #d9d9d9",
                        borderRadius: 4,
                        color: "#555",
                        fontSize: 14,
                        lineHeight: 1.4,
                      }}
                    >
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

              {card.type === "kanji" && (
                <Paragraph style={{ fontSize: 16, lineHeight: 1.5 }}>
                  {card.meaning}
                </Paragraph>
              )}

              {card.type === "sentence" && (
                <>
                  <Paragraph style={{ fontSize: 16, lineHeight: 1.5 }}>
                    {card.sentence?.en}
                  </Paragraph>
                  {card.sentence?.vi && (
                    <Paragraph style={{ fontSize: 16, lineHeight: 1.5 }}>
                      {card.sentence.vi}
                    </Paragraph>
                  )}
                </>
              )}
            </>
          )}

          {/* Back (details) */}
          {showDetail && (
            <>
              {card.type === "vocabulary" && (
                <>
                  <Divider />
                  <Title level={4}>{card.word}</Title>
                  <Text strong>{card.reading || convertedReading}</Text>
                  <br />
                  <Text>{card.meaning}</Text>

                  {card.exampleSentence && (
                    <Paragraph style={{ marginTop: 16 }}>
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
                      {card.exampleSentence.vi && (
                        <>{card.exampleSentence.vi}</>
                      )}
                    </Paragraph>
                  )}
                </>
              )}

              {card.type === "kanji" && (
                <>
                  <Divider />
                  <Title level={4}>{card.kanji}</Title>
                  <Text>{card.meaning}</Text>
                </>
              )}

              {card.type === "sentence" && (
                <>
                  <Divider />
                  <Paragraph style={{ fontSize: 16, lineHeight: 1.5 }}>
                    {card.sentence?.ja}
                  </Paragraph>
                  {card.sentence?.en && (
                    <Paragraph style={{ fontSize: 16, lineHeight: 1.5 }}>
                      {card.sentence.en}
                    </Paragraph>
                  )}
                  {card.sentence?.vi && (
                    <Paragraph style={{ fontSize: 16, lineHeight: 1.5 }}>
                      {card.sentence.vi}
                    </Paragraph>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default FlashCardApp;
