SPARQL Editor Autocomplete Issue
This repository demonstrates a specific issue with CodeMirror's autocomplete functionality in a SPARQL editor implementation. The goal is to gather community insights and solutions to fix this problem.
🐛 The Issue
When using the SPARQL editor with CodeMirror autocomplete:

Start with an empty editor
Type the first few characters of a word (e.g., type "sel")
Select a suggestion from the dropdown (e.g., "SELECT")
Expected behavior: The typed text should be replaced with the selection (e.g., "SELECT")
Actual behavior: The selection gets appended to the typed text (e.g., "selSELECT")

Important: This issue only occurs with the first word in an empty editor. In other contexts within the editor, the autocomplete works as expected.

https://github.com/user-attachments/assets/8f136f0c-e8c8-4ba5-b05c-2804235554d0

