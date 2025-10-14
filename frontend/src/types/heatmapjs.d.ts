declare module 'heatmap.js' {
  interface HeatmapDataPoint {
    x: number;
    y: number;
    value: number;
  }

  interface HeatmapConfig {
    container: HTMLElement;
    radius?: number;
    maxOpacity?: number;
    minOpacity?: number;
    blur?: number;
    gradient?: Record<number | string, string>;
  }

  interface HeatmapInstance {
    setData(data: { max: number; data: HeatmapDataPoint[] }): void;
    addData(data: HeatmapDataPoint[] | HeatmapDataPoint): void;
    repaint(): void;
    remove(): void;
  }

  const h337: {
    create: (cfg: HeatmapConfig) => HeatmapInstance;
  };

  export default h337;
}

