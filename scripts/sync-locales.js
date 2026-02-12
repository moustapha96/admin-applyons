/**
 * Synchronise toutes les clés de traduction : chaque fichier de langue
 * reçoit les clés manquantes depuis en.json (valeur anglaise en fallback).
 * Ainsi tout le dashboard affiche une traduction dans toutes les langues.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "..", "src", "i18n", "locales");
const referenceLang = "en";
const otherLangs = ["fr", "de", "es", "it", "zh"];

function getAllKeys(obj, prefix = "") {
  const keys = [];
  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (obj[key] !== null && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      keys.push(...getAllKeys(obj[key], path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

function getValueAtPath(obj, pathStr) {
  const parts = pathStr.split(".");
  let current = obj;
  for (const p of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[p];
  }
  return current;
}

function setValueAtPath(obj, pathStr, value) {
  const parts = pathStr.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!(p in current) || typeof current[p] !== "object" || current[p] === null) {
      current[p] = {};
    }
    current = current[p];
  }
  current[parts[parts.length - 1]] = value;
}

function syncLocale(reference, target, lang) {
  const refKeys = getAllKeys(reference);
  let added = 0;
  for (const key of refKeys) {
    const refVal = getValueAtPath(reference, key);
    if (refVal === undefined) continue;
    const targetVal = getValueAtPath(target, key);
    if (targetVal === undefined) {
      setValueAtPath(target, key, refVal);
      added++;
    }
  }
  return added;
}

function main() {
  const refPath = path.join(localesDir, `${referenceLang}.json`);
  const reference = JSON.parse(fs.readFileSync(refPath, "utf8"));

  console.log("Référence:", referenceLang, "- Clés totales:", getAllKeys(reference).length);

  for (const lang of otherLangs) {
    const filePath = path.join(localesDir, `${lang}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn("Fichier manquant:", filePath);
      continue;
    }
    const target = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const added = syncLocale(reference, target, lang);
    fs.writeFileSync(filePath, JSON.stringify(target, null, 4) + "\n", "utf8");
    console.log(lang + ":", added, "clé(s) ajoutée(s)");
  }

  console.log("Synchronisation terminée.");
}

main();
