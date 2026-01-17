<template>
  <div class="weather-box">
    <div class="left">
      <img v-if="data?.iconUrl" :src="data.iconUrl" class="icon" alt="weather icon" />
      <div v-else class="icon-placeholder">?</div>
    </div>

    <div class="right">
      <div class="top">
        <span class="temp">{{ displayTemp }}</span>
        <span class="minmax">{{ displayMinMax }}</span>
      </div>
      <div class="mid">{{ displayDesc }}</div>
      <div class="bottom">{{ displayCity }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WeatherBoxData } from "@/services/weatherService";
import {computed} from "vue";

const props = defineProps<{
  data: WeatherBoxData | null;
  loading: boolean;
  error: string | null;
}>();

const displayTemp = computed(() => {
  if (props.loading) return "—";
  if (props.error) return "—";
  if (!props.data || Number.isNaN(props.data.temp)) return "—";
  return `${props.data.temp}°`;
});

const displayMinMax = computed(() => {
  if (props.loading) return "min —  max —";
  if (props.error) return "min —  max —";
  if (!props.data) return "min —  max —";
  return `min ${props.data.tempMin}°  max ${props.data.tempMax}°`;
});

const displayDesc = computed(() => {
  if (props.loading) return "lädt...";
  if (props.error) return "unbekannt";
  return props.data?.description ?? "unbekannt";
});

const displayCity = computed(() => props.data?.city ?? "Berlin");
</script>

<style scoped>
.weather-box {
  width: 240px;
  height: 110px;
  border-radius: 14px;
  background: rgba(210, 190, 200, 0.55);
  border: 1px solid rgba(130, 90, 100, 0.25);
  display: flex;
  gap: 10px;
  padding: 12px;
  align-items: center;
}

.left {
  width: 72px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon {
  width: 62px;
  height: 62px;
}

.icon-placeholder {
  width: 62px;
  height: 62px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 28px;
  opacity: 0.7;
  border: 1px dashed rgba(130, 90, 100, 0.35);
}

.right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #7a4b56;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.temp {
  font-size: 26px;
  font-weight: 700;
}

.minmax {
  font-size: 12px;
  opacity: 0.85;
  white-space: nowrap;
}

.mid {
  font-size: 13px;
  opacity: 0.9;
  text-transform: lowercase;
}

.bottom {
  font-size: 13px;
  font-weight: 700;
  text-align: right;
}
</style>
