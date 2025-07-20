// App.tsx
import React, { useState, useEffect } from "react";
import { Card, Input, Button, message } from "antd";
import axios from "axios";
import Cookies from "js-cookie";
import FlashCardApp from "./components/Flashcard";

const containerStyle: React.CSSProperties = {
  maxWidth: "90vw",
  width: 400,
  margin: "10vh auto",
  padding: 20,
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 10,
};

const gridStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "center",
  padding: 20,
  fontSize: 18,
  cursor: "pointer",
  backgroundColor: "#fafafa",
  border: "1px solid #f0f0f0",
  marginBottom: 10,
};

type JLPTLevel = "N1" | "N2" | "N3" | "N4" | "N5";

const App = () => {
  const [screen, setScreen] = useState<"login" | "menu" | "question" | "flashcard">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [flashcards, setFlashcards] = useState<VocabFlashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setScreen("menu");
    }
  }, []);

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/login`, {
        username,
        password,
      });
      if (response.data.success) {
        const token = response.data.token;
        Cookies.set("token", token);
        message.success("Login successful");
        setScreen("menu");
      } else {
        message.error(response.data.message || "Login failed");
      }
    } catch (error) {
      message.error("Login failed. Please check your credentials.");
    }
  };

  const fetchFlashcards = async (level: JLPTLevel) => {
    setLoadingFlashcards(true);
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/flashcard${level}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFlashcards(res.data);
      setSelectedLevel(level);
      setCurrentIndex(0);
      setScreen("flashcard");
      message.success(`Loaded ${res.data.length} flashcards for ${level}`);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      message.error(`Failed to load flashcards for ${level}`);
    } finally {
      setLoadingFlashcards(false);
    }
  };

  const renderLogin = () => (
    <Card title="Login" style={containerStyle}>
      <Input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <Input.Password
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <Button type="primary" style={buttonStyle} onClick={handleLogin}>
        Login
      </Button>
    </Card>
  );

  const renderMenu = () => (
    <Card title="Choose Flashcard Level" style={containerStyle}>
      <Card.Grid
        style={gridStyle}
        onClick={() => setScreen("question")}
      >
        Question
      </Card.Grid>
      {(["N1", "N2", "N3", "N4", "N5"] as JLPTLevel[]).map((level) => (
        <Card.Grid
          key={level}
          style={gridStyle}
          onClick={() => fetchFlashcards(level)}
        >
          Flashcard {level}
        </Card.Grid>
      ))}
    </Card>
  );

  const renderQuestion = () => (
    <Card title="Questions" style={containerStyle}>
      <p>Here is the Questions screen.</p>
      <Button style={buttonStyle} onClick={() => setScreen("menu")}>
        Back to Menu
      </Button>
    </Card>
  );

  const renderFlashcard = () => {
    if (loadingFlashcards) {
      return (
        <div style={containerStyle}>
          <p>Loading flashcards...</p>
        </div>
      );
    }

    if (!flashcards.length) {
      return (
        <div style={containerStyle}>
          <p>No flashcards found.</p>
          <Button onClick={() => setScreen("menu")}>Back to Menu</Button>
        </div>
      );
    }

    const card = flashcards[currentIndex];

    const onNext = () => {
      if (currentIndex + 1 < flashcards.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        message.info("You reached the last card");
      }
    };

    const onPrev = () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else {
        message.info("This is the first card");
      }
    };

    return (
      <Card title={`Flashcards - ${selectedLevel}`} style={containerStyle}>
        <FlashCardApp card={card} onNext={onNext} onBack={onPrev} />

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <Button onClick={onPrev} disabled={currentIndex === 0}>
            − Previous
          </Button>
          <Button onClick={onNext} disabled={currentIndex === flashcards.length - 1}>
            + Next
          </Button>
        </div>

        <Button style={{ marginTop: 16, width: "100%" }} onClick={() => setScreen("menu")}>
          Back to Menu
        </Button>
      </Card>
    );
  };

  switch (screen) {
    case "login":
      return renderLogin();
    case "menu":
      return renderMenu();
    case "question":
      return renderQuestion();
    case "flashcard":
      return renderFlashcard();
    default:
      return null;
  }
};

export default App;
