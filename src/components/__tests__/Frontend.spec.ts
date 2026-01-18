import { mount } from "@vue/test-utils"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// ---------- Helper (TS strict safe) ----------
function assertDefined<T>(v: T | null | undefined, msg: string): asserts v is T {
  if (v === null || v === undefined) throw new Error(msg)
}

// ✅ HOISTED mocks (damit vi.mock factory nicht crasht)
const mocked = vi.hoisted(() => ({
  axiosGet: vi.fn(),
  routerPush: vi.fn(),
}))

// axios mock (keine externen Variablen ohne hoisted!)
vi.mock("axios", () => ({
  default: {
    get: mocked.axiosGet,
  },
}))

// vue-router mock (push ebenfalls hoisted)
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mocked.routerPush }),
  useRoute: () => ({ fullPath: "/eintrag/2026-01-14" }),
}))

import WeatherBox from "@/components/WeatherBox.vue"
import Kalendar from "@/components/Kalendar.vue"
import Sidebar from "@/components/Sidebar.vue"
import { fetchBerlinWeatherForDate } from "@/services/weatherService"

const flush = () => new Promise((r) => setTimeout(r, 0))

/* =========================================================
   1) + 2) WeatherBox
   ========================================================= */
describe("WeatherBox.vue", () => {
  it("zeigt Platzhalter und 'lädt...' wenn loading=true", () => {
    const wrapper = mount(WeatherBox, {
      props: {
        data: null,
        loading: true,
        error: null,
      },
    })

    expect(wrapper.text()).toContain("lädt")
    expect(wrapper.find(".temp").text()).toContain("—")
    expect(wrapper.find(".minmax").text()).toContain("min —")
  })

  it("zeigt Werte korrekt wenn data vorhanden ist", () => {
    const wrapper = mount(WeatherBox, {
      props: {
        loading: false,
        error: null,
        data: {
          city: "Berlin",
          date: "2026-01-14",
          temp: 4,
          tempMin: 1,
          tempMax: 6,
          condition: "Clouds",
          description: "bewölkt",
          iconUrl: "data:image/svg+xml;charset=utf-8,abc",
        },
      },
    })

    expect(wrapper.find(".temp").text()).toContain("4°")
    expect(wrapper.find(".minmax").text()).toContain("min 1°")
    expect(wrapper.find(".minmax").text()).toContain("max 6°")
    expect(wrapper.find(".mid").text().toLowerCase()).toContain("bewölkt")
    expect(wrapper.find(".bottom").text()).toContain("Berlin")
    expect(wrapper.find("img.icon").exists()).toBe(true)
  })
})

/* =========================================================
   3) Kalendar
   ========================================================= */
describe("Kalendar.vue", () => {
  it("emittiert 'select' mit korrektem Payload beim Klick auf einen Tag", async () => {
    const wrapper = mount(Kalendar, {
      props: {
        year: 2026,
        month: 0, // Januar
        periodDates: new Set<string>(["2026-01-15"]),
      },
    })

    const btn15 = wrapper
      .findAll("button.cell")
      .find((b) => b.text().trim() === "15")

    assertDefined(btn15, "Button für Tag 15 wurde nicht gefunden.")
    await btn15.trigger("click")

    const emitted = wrapper.emitted("select")
    assertDefined(emitted, "Event 'select' wurde nicht emitted.")
    const first = emitted[0]
    assertDefined(first, "Kein erster Emit-Eintrag vorhanden.")
    const payload = first[0]
    assertDefined(payload, "Kein Payload im ersten Emit-Eintrag vorhanden.")

    expect(payload).toEqual({ day: 15, month: 0, year: 2026 })
  })
})

/* =========================================================
   4) Sidebar (axios + routing)
   ========================================================= */
describe("Sidebar.vue", () => {
  beforeEach(() => {
    mocked.routerPush.mockReset()
    mocked.axiosGet.mockReset()
  })

  it("nimmt pro Datum den höchsten id-Eintrag, sortiert absteigend und navigiert beim Klick", async () => {
    mocked.axiosGet.mockResolvedValue({
      data: [
        { id: 1, date: "14-01-2026", symptom: "A", note: "x" },
        { id: 9, date: "14-01-2026", symptom: "B", note: "y" }, // gleicher Tag, höhere id gewinnt
        { id: 2, date: "13-01-2026", symptom: "C", note: "z" },
      ],
    })

    const wrapper = mount(Sidebar)
    await flush()

    // Panel öffnen
    await wrapper.find('button[title="Menü"]').trigger("click")
    await flush()

    const items = wrapper.findAll("li.item")
    expect(items.length).toBe(2)

    const firstItem = items[0]
    assertDefined(firstItem, "Erstes Sidebar-Item fehlt.")

    expect(firstItem.text()).toContain("14-01-2026")
    expect(firstItem.text()).toContain("B")

    await firstItem.trigger("click")
    expect(mocked.routerPush).toHaveBeenCalledWith({
      name: "eintrag",
      params: { date: "2026-01-14" },
    })
  })
})

/* =========================================================
   5) weatherService (fetch mock)
   ========================================================= */
describe("weatherService.ts", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-14T10:00:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("holt Forecast über fetch und mapped die Daten korrekt", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        daily: {
          time: ["2026-01-14"],
          temperature_2m_min: [1.2],
          temperature_2m_max: [5.6],
          weather_code: [3],
        },
        hourly: {
          time: ["2026-01-14T09:00", "2026-01-14T12:00"],
          temperature_2m: [2.0, 4.0],
          weather_code: [3, 3],
        },
      }),
    })

    vi.stubGlobal("fetch", fetchMock as any)

    const w = await fetchBerlinWeatherForDate("2026-01-14")

    expect(fetchMock).toHaveBeenCalledTimes(1)

    const call0 = fetchMock.mock.calls[0]
    assertDefined(call0, "fetch wurde nicht aufgerufen (kein call[0]).")
    const urlArg = call0[0]
    assertDefined(urlArg, "fetch call[0][0] (URL) fehlt.")

    const url = String(urlArg)
    expect(url).toContain("api.open-meteo.com/v1/forecast")
    expect(url).toContain("past_days=92")

    expect(w.city).toBe("Berlin")
    expect(w.date).toBe("2026-01-14")
    expect(w.temp).toBe(4)
    expect(w.tempMin).toBe(1)
    expect(w.tempMax).toBe(6)
    expect(w.description.toLowerCase()).toContain("bewölkt")
    expect(w.iconUrl.startsWith("data:image/svg+xml")).toBe(true)
  })
})
