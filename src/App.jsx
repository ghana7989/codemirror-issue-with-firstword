import React, { useState, createContext, useContext } from 'react';
import { autocompletion } from "@codemirror/autocomplete";
import { sql } from "@codemirror/lang-sql";
import CodeMirror from "@uiw/react-codemirror";
import { sparql } from "codemirror-lang-sparql";

// ===== MOCK DATA =====
// Mock SPARQL keywords and snippets
const keywords = [
  { label: "SELECT", type: "keyword" },
  { label: "WHERE", type: "keyword" },
  { label: "FILTER", type: "keyword" },
  { label: "OPTIONAL", type: "keyword" },
  { label: "GRAPH", type: "keyword" },
];

const snippets = [
  { label: "SELECT ?subject ?predicate ?object WHERE { ?subject ?predicate ?object }", type: "snippet" },
  { label: "FILTER(?value > 10)", type: "snippet" },
];

// Mock node names context
const NodeNamesContext = createContext();

const useNodeNames = () => {
  const context = useContext(NodeNamesContext);
  if (!context) {
    throw new Error("useNodeNames must be used within a NodeNamesProvider");
  }
  return context;
};

const NodeNamesProvider = ({ children }) => {
  const getAllNodeNames = () => [
    "Person",
    "Organization",
    "Event",
    "Location",
    "Date",
    "Document"
  ];

  return (
    <NodeNamesContext.Provider value={{ getAllNodeNames }}>
      {children}
    </NodeNamesContext.Provider>
  );
};

// ===== ORIGINAL EDITOR WITH ISSUE =====
const customSparqlKeywords = [...keywords, ...snippets];

function sparqlCompletion(context) {
  let word = context.matchBefore(/[\w:.-]+/);
  const wordLower = (word?.text || "").toLowerCase();
  const from = word?.from || context.pos;

  const sparqlOptions = customSparqlKeywords.filter((option) =>
    option.label.toLowerCase().startsWith(wordLower)
  );

  return {
    from,
    options: sparqlOptions,
  };
}

const OriginalSparqlEditor = ({ value, onChange, defaultValue }) => {
  const { getAllNodeNames } = useNodeNames();
  const nodeNames = getAllNodeNames();

  const nodeNamesCompletion = nodeNames.map((name) => ({
    label: name,
    type: "variable",
  }));

  function combinedCompletion(context) {
    let word = context.matchBefore(/[\w:.-]+/);
    const wordLower = word?.text?.toLowerCase() || "";
    const from = word?.from || context.pos;

    let sparqlSuggestions = null;

    try {
      sparqlSuggestions = sparqlCompletion(context);
    } catch (e) {
      console.warn("SPARQL completion error:", e);
    }

    const filteredNodeNames = nodeNamesCompletion.filter(
      (option) => !wordLower || option.label.toLowerCase().startsWith(wordLower)
    );
    if (
      wordLower !== "" &&
      !context.explicit &&
      !sparqlSuggestions?.options?.length &&
      !filteredNodeNames.length
    ) {
      return null;
    }
    const fromPos = from;

    return {
      from: fromPos,
      options: [...(sparqlSuggestions?.options || []), ...filteredNodeNames],
    };
  }

  return (
    <CodeMirror
      value={value || defaultValue || ""}
      height="200px"
      extensions={[
        sparql(),
        sql(),
        autocompletion({
          override: [combinedCompletion],
          activateOnTyping: true,
          closeOnBlur: false,
          defaultKeymap: true,
          maxRenderedOptions: 100,
          defaultCompletion: combinedCompletion,
          icons: true,
        }),
      ]}
      onChange={onChange}
      theme="light"
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: true,
        highlightSelectionMatches: true,
        autocompletion: true,
        syntaxHighlighting: true,
        history: true,
      }}
    />
  );
};


// ===== DEMO APPLICATION =====
export default function App() {
  const [originalValue, setOriginalValue] = useState("");

  return (
    <NodeNamesProvider>
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>SPARQL Editor Completion Demo</h1>

        <div style={{ marginBottom: "40px" }}>
          <h2>Original Editor (with issue)</h2>
          <p>Type "sel" and select "SELECT" from the dropdown - notice how it appends instead of replaces (only happens when it is the first word)</p>
          <OriginalSparqlEditor
            value={originalValue}
            onChange={setOriginalValue}
          />
          <div style={{ marginTop: "10px" }}>
            <strong>Current Value:</strong>
            <pre style={{ background: "#f5f5f5", padding: "10px" }}>{originalValue}</pre>
          </div>
        </div>
      </div>
    </NodeNamesProvider>
  );
}
