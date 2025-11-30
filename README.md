# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh







import { Editor } from '@tinymce/tinymce-react';


---------------------------
npm install react-quill


import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';


<ReactQuill
  theme="snow"
  value={editorContent}
  modules={module}
  onChange={setEditorContent}
  className="custom-quill-editor"
/>

Points clés :

theme="snow" : Utilise le thème "snow" (il existe aussi "bubble").
value : Contenu actuel de l'éditeur.
onChange : Fonction appelée à chaque modification du contenu.
modules : Permet de configurer les fonctionnalités (barre d'outils, formats, etc.).
className : Pour styliser l'éditeur avec du CSS.