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
    // setShowDetail(false); // reset when new card comes
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

  return (
    <div
      {...handlers}
      onClick={handleTap}
      style={{
        touchAction: "pan-y",
        display: "flex",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <Card
        title={{ vocabulary: "Vocabulary", kanji: "Kanji", sentence: "Sentence" }[card.type]}
        style={{
          margin: 0,
          fontSize: "14px",
          lineHeight: 1.6,
          width: 300, // Fixed width
          maxWidth: 480,
          height: 400, // Fixed height
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
        bodyStyle={{
          flex: 1,
          overflowY: "auto", // Allow scroll if content is long
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
            {card.type === "vocabulary" && <Title level={4}>{card.word}</Title>}
            {card.type === "kanji" && <Title level={4}>{card.kanji}</Title>}
            {card.type === "sentence" && <Paragraph>{card.sentence?.ja}</Paragraph>}
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

            {card.type === "kanji" && (
              <>
                <Title level={4}>{card.kanji}</Title>
                <Text>{card.meaning}</Text>
              </>
            )}

            {card.type === "sentence" && (
              <>
                <Paragraph>{card.sentence?.ja}</Paragraph>
                {card.sentence?.en && <Paragraph>{card.sentence.en}</Paragraph>}
                {card.sentence?.vi && <Paragraph>{card.sentence.vi}</Paragraph>}
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default FlashCardApp;
