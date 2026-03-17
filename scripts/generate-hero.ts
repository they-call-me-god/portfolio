/**
 * Hero image generation script.
 *
 * The hero image is generated via the Nanobanana MCP tool inside a Claude Code session.
 * To regenerate: open this project in Claude Code and ask:
 *   "Use Nanobanana to generate a hero image with this prompt and save to public/hero.jpg"
 *
 * Prompt used:
 *   "A dark atmospheric abstract background for a personal portfolio website.
 *    Deep navy and charcoal tones with subtle geometric light rays and soft bokeh.
 *    Minimal, modern, cinematic. No text. No faces. No objects. Pure abstract ambience."
 *
 * Aspect ratio: 16:9
 * Output: public/hero.jpg  (or public/hero.svg as fallback)
 *
 * Note: Nanobanana uses Gemini image generation which has a free-tier daily quota.
 * If you hit a quota error, wait until the next day and try again.
 */

console.log('To regenerate the hero image:')
console.log('1. Open this project in Claude Code')
console.log('2. Ask Claude to use Nanobanana MCP to generate the hero image')
console.log('3. See the prompt documented in this file')
