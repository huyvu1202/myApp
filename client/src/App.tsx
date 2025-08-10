// App.tsx
import React, { useState, useEffect } from "react";
import { Card, Input, Button, message } from "antd";
import axios from "axios";
import Cookies from "js-cookie";
import FlashCardApp from "./components/Flashcard";

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "100vw",
  height: "100vh",
  padding: 20,
  boxSizing: "border-box",
  overflow: "auto",
  backgroundColor: "#f9f9f9",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 5,
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
  const [screen, setScreen] = useState<
    "login" | "menu" | "question" | "flashcard"
  >("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [flashcards, setFlashcards] = useState<VocabFlashcard[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel | null>(null);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setScreen("menu");
    }
  }, []);

  // Hàm lấy key localStorage cho từng level
  const getStorageKey = (level: JLPTLevel) => `currentIndex_${level}`;

  // Lưu currentIndex cho level
  const saveCurrentIndex = (level: JLPTLevel, index: number) => {
    setCurrentIndex(index);
    localStorage.setItem(getStorageKey(level), index.toString());
  };

  // Lấy currentIndex cho level, trả về 0 nếu chưa có
  const loadCurrentIndex = (level: JLPTLevel): number => {
    const saved = localStorage.getItem(getStorageKey(level));
    return saved ? parseInt(saved, 10) : 0;
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/login`,
        {
          username,
          password,
        }
      );
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
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/flashcard${level}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFlashcards(res.data);
      setSelectedLevel(level);

      // Lấy index đã lưu cho level hoặc 0 nếu chưa có
      const savedIndex = loadCurrentIndex(level);
      setCurrentIndex(savedIndex);

      setScreen("flashcard");
      message.success(`Loaded ${res.data.length} flashcards for ${level}`);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      message.error(`Failed to load flashcards for ${level}`);
    } finally {
      setLoadingFlashcards(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    setFlashcards([]);
    setCurrentIndex(0);
    setSelectedLevel(null);
    setUsername("");
    setPassword("");
    setScreen("login");
    message.success("Logged out and cleared data");
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
      <Card.Grid style={gridStyle} onClick={() => setScreen("question")}>
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
      <Button
        danger
        style={{ marginTop: 20, width: "100%" }}
        onClick={handleLogout}
      >
        Logout & Clear Data
      </Button>
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
      if (currentIndex + 1 < flashcards.length && selectedLevel) {
        saveCurrentIndex(selectedLevel, currentIndex + 1);
      } else {
        message.info("You reached the last card");
      }
    };

    const onPrev = () => {
      if (currentIndex > 0 && selectedLevel) {
        saveCurrentIndex(selectedLevel, currentIndex - 1);
      } else {
        message.info("This is the first card");
      }
    };

    return (
      <Card title={`Flashcards - ${selectedLevel}`} style={containerStyle}>
        <FlashCardApp card={card} onNext={onNext} onBack={onPrev} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 0,
          }}
        >
          <Button onClick={onPrev} disabled={currentIndex === 0}>
            − Previous
          </Button>
          <Button
            onClick={onNext}
            disabled={currentIndex === flashcards.length - 1}
          >
            + Next
          </Button>
        </div>

        <Button
          style={{ marginTop: 5, width: "100%" }}
          onClick={() => setScreen("menu")}
        >
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
