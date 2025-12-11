<script setup lang="ts">
interface CardProps {
  title: string
  number: number
  icon: string
  provenance: string
  isMonetary: boolean
  color: string
}

const props = defineProps<CardProps>()

const variantClasses = computed(() => {
  switch (props.color) {
    case 'violet':
      return 'border-violet-100 bg-violet-50 text-violet-500'
    case 'emerald':
      return 'border-emerald-100 bg-emerald-50 text-emerald-500'
    case 'rose':
      return 'border-rose-100 bg-rose-50 text-rose-500'
    case 'default':
      return 'border-violet-100 bg-violet-50 text-violet-500'
  }
})

const btnClasses = computed(() => {
  return `${variantClasses.value}`
})
</script>

<template>
  <div
    class="flex flex-col text-black rounded-lg border border-slate-200 hover:border-slate-300 active:border-violet-300"
  >
    <div class="flex justify-between items-center p-5 grow">
      <dl>
        <dt class="text-2xl font-bold">
          {{ isMonetary ? 'XAF' : '' }}{{ number.toLocaleString('de-DE') }}
        </dt>
        <dd class="text-sm font-medium text-slate-500">
          {{ title }}
        </dd>
      </dl>

      <div
        :class="btnClasses"
        class="flex justify-center items-center w-12 h-12 rounded-xl border"
      >
        <Icon :name="icon" />
      </div>
    </div>

    <div class="px-5 py-3 text-xs font-medium border-t border-slate-100 text-slate-500">
      <p>{{ provenance }}</p>
    </div>
  </div>
</template>

<style lang="css" scoped></style>
