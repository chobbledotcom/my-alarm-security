#!/usr/bin/env node

/**
 * Site conversion script - wrapper for the modular importer
 *
 * This script maintains backward compatibility while using
 * the new modular importer structure.
 */

const importer = require('./importer');

// Run the conversion
importer.main();