// src/components/QuestionForm.jsx
import { useState } from "react";
import { generateQuestion } from "../services/api";

const QuestionForm = () => {
  const [context, setContext] = useState("");
  const [mapel, setMapel] = useState("IPA");
  const [topic, setTopic] = useState("Algoritma");
  const [difficulty, setDifficulty] = useState("sedang");
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await generateQuestion({
        question_text: context,
        mapel,
        topic,
        difficulty,
      });
      setQuestion(result);
    } catch (err) {
      setError("Error generating question.");
    }
    setLoading(false);
  };

  return (
    <div className="question-form">
      <h2>Generate Question</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Context:</label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            required
            rows="4"
          />
        </div>

        <div>
          <label>Mapel:</label>
          <input
            type="text"
            value={mapel}
            onChange={(e) => setMapel(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Topic:</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="mudah">Mudah</option>
            <option value="sedang">Sedang</option>
            <option value="sulit">Sulit</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Question"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {question && (
        <div className="generated-question">
          <h3>Generated Question:</h3>
          <p>
            <strong>Question:</strong> {question.question}
          </p>
          <ul>
            {question.options.map((opt, index) => (
              <li key={index}>
                {opt} {index === question.answer_index && "(Correct)"}
              </li>
            ))}
          </ul>
          <p>
            <strong>Explanation:</strong> {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionForm;
