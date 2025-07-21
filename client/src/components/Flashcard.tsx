import React, { useState, useEffect } from "react";
import { Card, Typography, Tag } from "antd";
import { useSwipeable } from "react-swipeable";
import { toHiragana } from "wanakana";

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

  useEffect(() => {
    if (card.type === "vocabulary" && !card.reading) {
      const result = convertToHiragana(card.word);
      setConvertedReading(result);
    }
  }, [card]);

  // Swipe handlers...
  const handlers = useSwipeable({
    onSwipedLeft: () => onNext(),
    onSwipedRight: () => onBack(),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const handleTap = () => setShowDetail(!showDetail);

  return (
    <div {...handlers} onClick={handleTap} style={{ touchAction: "pan-y", display: "flex", justifyContent: "center" }}>
      <Card
        title={{ vocabulary: "Vocabulary", kanji: "Kanji", sentence: "Sentence" }[card.type]}
        style={{ margin: 16, fontSize: "14px", lineHeight: 1.6, width: "100%", maxWidth: 480 }}
        bodyStyle={{ minHeight: 200 }}
      >
        {card.tags?.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}

        {!showDetail && (
          <>
            {card.type === "vocabulary" && <Title level={4}>{card.word}</Title>}
            {card.type === "kanji" && <Title level={4}>{card.kanji}</Title>}
            {card.type === "sentence" && <Paragraph>{card.sentence.ja}</Paragraph>}
          </>
        )}

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
            {/* kanji and sentence detail omitted for brevity */}
          </div>
        )}
      </Card>
    </div>
  );
};

export default FlashCardApp;
