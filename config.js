/**
 * config.js — All game constants in one place.
 * These are true constants (never change after startup).
 * Loaded first (after p5.js) so every other file can reference them.
 */

// --- Grid and map dimensions ---
const GRID_SIZE_X = 16;
const GRID_SIZE_Y = 16;
const FONT_NAME = 'monospace';
const MAP_WIDTH = 60;
const MAP_HEIGHT = 60;

// --- Key codes ---
const Q = 81;
const W = 87;
const E = 69;
const A = 65;
const S = 83;
const D = 68;
const Z = 90;
const X = 88;
const C = 67;

// --- Render modes ---
const NORMAL = 0;
const LINE_OF_SIGHT = 1;
const LINE_OF_SIGHT_PLUS = 3;
const RECIPROCAL_LINE_OF_SIGHT = 4;

// --- Light constants ---
const LIGHT_FALL_OFF = 0.85;
const LIGHT_THRESHOLD = 129;
const MAX_LIGHT_DISTANCE = 20;
const MEMORY_LIGHT = [50, 50, 100];

// --- Display ---
const BACKGROUND_COLOR = [20, 20, 40];
