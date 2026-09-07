<script setup>
import checkIcon from '../../assets/icons/check.svg'

import glutenIcon from '../../assets/icons/restrictions/gluten.svg'
import crustaceansIcon from '../../assets/icons/restrictions/crustaceans.svg'
import eggsIcon from '../../assets/icons/restrictions/eggs.svg'
import fishIcon from '../../assets/icons/restrictions/fish.svg'
import peanutsIcon from '../../assets/icons/restrictions/peanuts.svg'
import soyIcon from '../../assets/icons/restrictions/soy.svg'
import milkIcon from '../../assets/icons/restrictions/milk.svg'
import nutsIcon from '../../assets/icons/restrictions/nuts.svg'
import celeryIcon from '../../assets/icons/restrictions/celery.svg'
import mustardIcon from '../../assets/icons/restrictions/mustard.svg'
import sesameIcon from '../../assets/icons/restrictions/sesame.svg'
import sulphitesIcon from '../../assets/icons/restrictions/sulphites.svg'
import lupinIcon from '../../assets/icons/restrictions/lupin.svg'
import molluscsIcon from '../../assets/icons/restrictions/molluscs.svg'

import vegetarianIcon from '../../assets/icons/restrictions/vegetarian.svg'
import veganIcon from '../../assets/icons/restrictions/vegan.svg'
import pescatarianIcon from '../../assets/icons/restrictions/pescatarian.svg'
import halalIcon from '../../assets/icons/restrictions/halal.svg'
import kosherIcon from '../../assets/icons/restrictions/kosher.svg'

import './RestrictionCard.css'

const props = defineProps({
  restriction: {
    type: Object,
    required: true,
  },

  selected: {
    type: Boolean,
    default: false,
  },

  summary: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['toggle'])

const restrictionIcons = {
  Gluten: glutenIcon,
  Crustáceos: crustaceansIcon,
  Huevos: eggsIcon,
  Pescado: fishIcon,
  Cacahuetes: peanutsIcon,
  Soja: soyIcon,
  Lácteos: milkIcon,
  'Frutos de cáscara': nutsIcon,
  Apio: celeryIcon,
  Mostaza: mustardIcon,
  'Semillas de sésamo': sesameIcon,
  'Dióxido de azufre y sulfitos': sulphitesIcon,
  Altramuces: lupinIcon,
  Moluscos: molluscsIcon,

  Vegetariano: vegetarianIcon,
  Vegano: veganIcon,
  Pescetariano: pescatarianIcon,
  Halal: halalIcon,
  Kosher: kosherIcon,
}

const restrictionIcon = () => restrictionIcons[props.restriction.name]
</script>

<template>
  <button
    type="button"
    class="restriction-card"
    :class="[
      `restriction-card--${restriction.type}`,
      {
        'restriction-card--selected': selected,
        'restriction-card--summary': summary,
      },
    ]"
    @click="$emit('toggle', restriction.id)"
  >
    <img :src="restrictionIcon()" alt="" class="restriction-icon" />

    <span class="restriction-name">
      {{ restriction.name }}
    </span>

    <span v-if="selected && !summary" class="restriction-check">
      <img :src="checkIcon" alt="" />
    </span>
  </button>
</template>
