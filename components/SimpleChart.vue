<template>
  <div class="w-full h-full">
    <!-- Chart Container -->
    <div
      ref="chartContainer"
      class="relative w-full h-full"
      :style="{ height: height + 'px' }"
    >
      <!-- Chart Canvas -->
      <svg
        :width="svgWidth"
        :height="svgHeight"
        class="w-full h-full"
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
      >
        <!-- Grid lines -->
        <g v-if="showGrid" class="grid-lines">
          <!-- Horizontal grid lines -->
          <line
            v-for="y in horizontalGridLines"
            :key="`h-${y}`"
            :x1="padding"
            :y1="y"
            :x2="svgWidth - padding"
            :y2="y"
            stroke="#f3f4f6"
            stroke-width="1"
          />
          <!-- Vertical grid lines -->
          <line
            v-for="x in verticalGridLines"
            :key="`v-${x}`"
            :x1="x"
            :y1="padding"
            :x2="x"
            :y2="svgHeight - padding"
            stroke="#f3f4f6"
            stroke-width="1"
          />
        </g>

        <!-- Line Chart -->
        <g v-if="type === 'line'">
          <polyline
            :points="linePoints"
            fill="none"
            :stroke="color"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- Data points -->
          <circle
            v-for="(point, index) in dataPoints"
            :key="index"
            :cx="point.x"
            :cy="point.y"
            r="4"
            :fill="color"
            class="hover:r-6 transition-all cursor-pointer"
            @mouseenter="showTooltip(index, point, $event)"
            @mouseleave="hideTooltip"
          />
        </g>

        <!-- Bar Chart -->
        <g v-if="type === 'bar'">
          <rect
            v-for="(bar, index) in bars"
            :key="index"
            :x="bar.x"
            :y="bar.y"
            :width="bar.width"
            :height="bar.height"
            :fill="color"
            class="hover:opacity-80 transition-opacity cursor-pointer"
            @mouseenter="showTooltip(index, bar, $event)"
            @mouseleave="hideTooltip"
          />
        </g>

        <!-- Area Chart -->
        <g v-if="type === 'area'">
          <defs>
            <linearGradient :id="gradientId" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" :stop-color="color" stop-opacity="0.4" />
              <stop offset="100%" :stop-color="color" stop-opacity="0.1" />
            </linearGradient>
          </defs>
          <path :d="areaPath" :fill="`url(#${gradientId})`" />
          <polyline
            :points="linePoints"
            fill="none"
            :stroke="color"
            stroke-width="2"
          />
        </g>

        <!-- X-axis labels -->
        <g class="x-axis">
          <text
            v-for="(label, index) in labels"
            :key="index"
            :x="getXPosition(index)"
            :y="svgHeight - padding + 20"
            text-anchor="middle"
            class="text-xs fill-gray-600"
          >
            {{ label }}
          </text>
        </g>

        <!-- Y-axis labels -->
        <g class="y-axis">
          <text
            v-for="(value, index) in yAxisValues"
            :key="index"
            :x="padding - 10"
            :y="getYPosition(value) + 4"
            text-anchor="end"
            class="text-xs fill-gray-600"
          >
            {{ formatYAxisValue(value) }}
          </text>
        </g>
      </svg>

      <!-- Tooltip -->
      <div
        v-if="tooltip.show"
        ref="tooltipEl"
        class="absolute bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none z-10"
        :style="{
          left: tooltip.x + 'px',
          top: tooltip.y + 'px',
          transform: 'translate(-50%, -100%)',
        }"
      >
        <div class="font-medium">{{ tooltip.label }}</div>
        <div>{{ formatTooltipValue(tooltip.value) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  data: number[];
  labels: string[];
  type?: "line" | "bar" | "area";
  color?: string;
  height?: number;
  showGrid?: boolean;
  formatValue?: (value: number) => string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "line",
  color: "#3b82f6",
  height: 200,
  showGrid: true,
  formatValue: (value: number) => value.toString(),
});

// Reactive properties
const chartContainer = ref<HTMLElement>();
const tooltipEl = ref<HTMLElement>();
const svgWidth = ref(400);
const svgHeight = ref(200);
const padding = 40;

// Tooltip state
const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  label: "",
  value: 0,
});

// Computed properties
const maxValue = computed(() => Math.max(...props.data, 0));
const minValue = computed(() => Math.min(...props.data, 0));
const range = computed(() => maxValue.value - minValue.value || 1);

const gradientId = computed(
  () => `gradient-${Math.random().toString(36).substr(2, 9)}`
);

// Chart dimensions
const chartWidth = computed(() => svgWidth.value - padding * 2);
const chartHeight = computed(() => svgHeight.value - padding * 2);

// Data points for line/area charts
const dataPoints = computed(() => {
  return props.data.map((value, index) => ({
    x: getXPosition(index),
    y: getYPosition(value),
    value,
  }));
});

// Line points string for SVG polyline
const linePoints = computed(() => {
  return dataPoints.value.map((point) => `${point.x},${point.y}`).join(" ");
});

// Area path for area chart
const areaPath = computed(() => {
  if (dataPoints.value.length === 0) return "";

  let path = `M ${dataPoints.value[0].x} ${svgHeight.value - padding}`;
  dataPoints.value.forEach((point) => {
    path += ` L ${point.x} ${point.y}`;
  });
  path += ` L ${dataPoints.value[dataPoints.value.length - 1].x} ${
    svgHeight.value - padding
  } Z`;

  return path;
});

// Bars for bar chart
const bars = computed(() => {
  const barWidth = (chartWidth.value / props.data.length) * 0.8;
  const barSpacing = (chartWidth.value / props.data.length) * 0.2;

  return props.data.map((value, index) => {
    const x = getXPosition(index) - barWidth / 2;
    const height = (value / maxValue.value) * chartHeight.value;
    const y = svgHeight.value - padding - height;

    return {
      x,
      y,
      width: barWidth,
      height,
      value,
    };
  });
});

// Grid lines
const horizontalGridLines = computed(() => {
  const lines = [];
  const steps = 5;
  for (let i = 0; i <= steps; i++) {
    const y = padding + (chartHeight.value / steps) * i;
    lines.push(y);
  }
  return lines;
});

const verticalGridLines = computed(() => {
  return props.data.map((_, index) => getXPosition(index));
});

// Y-axis values
const yAxisValues = computed(() => {
  const steps = 5;
  const values = [];
  for (let i = 0; i <= steps; i++) {
    const value = maxValue.value - (maxValue.value / steps) * i;
    values.push(value);
  }
  return values;
});

// Helper functions
function getXPosition(index: number): number {
  if (props.data.length <= 1) return svgWidth.value / 2;
  return padding + (chartWidth.value / (props.data.length - 1)) * index;
}

function getYPosition(value: number): number {
  const normalizedValue = (value - minValue.value) / range.value;
  return svgHeight.value - padding - normalizedValue * chartHeight.value;
}

function formatYAxisValue(value: number): string {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + "M";
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + "K";
  }
  return Math.round(value).toString();
}

function formatTooltipValue(value: number): string {
  return props.formatValue(value);
}

// Tooltip methods
function showTooltip(index: number, point: any, event: MouseEvent) {
  const rect = chartContainer.value?.getBoundingClientRect();
  if (rect) {
    tooltip.value = {
      show: true,
      x: point.x,
      y: point.y - 10,
      label: props.labels[index] || `Point ${index + 1}`,
      value: point.value || props.data[index],
    };
  }
}

function hideTooltip() {
  tooltip.value.show = false;
}

// Resize observer
onMounted(() => {
  if (chartContainer.value) {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        svgWidth.value = entry.contentRect.width;
        svgHeight.value = props.height;
      }
    });

    resizeObserver.observe(chartContainer.value);

    onUnmounted(() => {
      resizeObserver.disconnect();
    });
  }
});

// Initial size
watchEffect(() => {
  if (chartContainer.value) {
    svgWidth.value = chartContainer.value.offsetWidth || 400;
    svgHeight.value = props.height;
  }
});
</script>
