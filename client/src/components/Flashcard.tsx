import React, { useState, useEffect } from "react";
import { Card, Typography, Tag } from "antd";
import { useSwipeable } from "react-swipeable";
import Kuroshiro from "kuroshiro";
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";

const { Title, Text, Paragraph } = Typography;

// Props
interface FlashcardProps {
  card: Flashcard;
  onNext: () => void;
  onBack: () => void;
}

const convertToHiragana = async (text: string) => {
  const kuroshiro = new Kuroshiro();
  await kuroshiro.init(new KuromojiAnalyzer());
  const result = await kuroshiro.convert(text, { to: "hiragana" });
  return result;
};

const FlashCardApp: React.FC<FlashcardProps> = ({ card, onNext, onBack }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [convertedReading, setConvertedReading] = useState<string>("");

  useEffect(() => {
    const fetchConvertedReading = async () => {
      if (card.type === "vocabulary" && !card.reading) {
        const result = await convertToHiragana(card.word);
        setConvertedReading(result);
      }
    };

    fetchConvertedReading();
  }, [card.type === "vocabulary" ? card.reading : null, card.type === "vocabulary" ? card.word : null]);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      console.log("Swiped left - moving to next card");
      onNext();
    },
    onSwipedRight: () => {
      console.log("Swiped right - moving to previous card");
      onBack();
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const handleTap = () => {
    setShowDetail(!showDetail);
  };

  return (
    <div
      {...handlers}
      onClick={handleTap}
      style={{
        touchAction: "pan-y",
        display: "flex",
        justifyContent: "center",
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
          margin: 16,
          fontSize: "14px",
          lineHeight: 1.6,
          width: "100%",
          maxWidth: 480,
        }}
        bodyStyle={{ minHeight: 200 }}
      >
        {/* Tags */}
        {card.tags?.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}

        {/* Front side */}
        {!showDetail && (
          <>
            {card.type === "vocabulary" && <Title level={4}>{card.word}</Title>}
            {card.type === "kanji" && <Title level={4}>{card.kanji}</Title>}
            {card.type === "sentence" && (
              <Paragraph>{card.sentence.ja}</Paragraph>
            )}
          </>
        )}

        {/* Detail side */}
        {showDetail && (
          <div style={{ fontSize: "14px" }}>
            {card.type === "vocabulary" && (
              <>
                <Title level={4}>{card.word}</Title>
                <Text>
                  {card.reading || convertedReading} {/* Use converted reading if card.reading is empty */}
                  <br />
                </Text>
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
                <Text>
                  <b>Onyomi:</b> {card.onyomi.join(", ")}
                </Text>
                <br />
                <Text>
                  <b>Kunyomi:</b> {card.kunyomi.join(", ")}
                </Text>
                <br />
                <Text>
                  <b>Meaning:</b> {card.meaning}
                </Text>
                <br />
                <Text>
                  <b>Strokes:</b> {card.strokes}
                </Text>
                <br />
                {card.radicals && (
                  <>
                    <Text>
                      <b>Radicals:</b> {card.radicals.join(", ")}
                    </Text>
                    <br />
                  </>
                )}
                {card.exampleWords && (
                  <Paragraph style={{ marginTop: 8 }}>
                    <b>Examples:</b>
                    <br />
                    {card.exampleWords.map((word) => (
                      <div key={word}>{word}</div>
                    ))}
                  </Paragraph>
                )}
              </>
            )}

            {card.type === "sentence" && (
              <>
                <Paragraph>
                  <b>Japanese:</b>
                  <br />
                  {card.sentence.ja}
                  <br />
                  {card.sentence.en && (
                    <>
                      <b>English:</b>
                      <br />
                      {card.sentence.en}
                      <br />
                    </>
                  )}
                  {card.sentence.vi && (
                    <>
                      <b>Vietnamese:</b>
                      <br />
                      {card.sentence.vi}
                    </>
                  )}
                </Paragraph>
                {card.grammarPoints && (
                  <Paragraph>
                    <b>Grammar:</b>
                    <br />
                    {card.grammarPoints.map((g) => (
                      <Tag key={g}>{g}</Tag>
                    ))}
                  </Paragraph>
                )}
                {card.audioUrl && (
                  <audio
                    controls
                    src={card.audioUrl}
                    style={{ marginTop: 10, width: "100%" }}
                  />
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
