/**
 * Public API of the pure SHI engine. Framework-free: nothing here imports React.
 * See docs/design/01_shi_model.md for the model this implements.
 */
export * from './constants.ts';
export * from './types.ts';
export * from './grid.ts';
export * from './suitability.ts';
export * from './area.ts';
export * from './connectivity.ts';
export * from './shs.ts';
export * from './aggregate.ts';
export { clamp } from './clamp.ts';
