<script setup>
import './UserAvatar.css'
import userIcon from '../../assets/icons/user.svg'

defineProps({
  size: {
    type: Number,
    default: 58,
  },
})
</script>

<template>
  <div class="user-avatar" :style="{ width: `${size}px`, height: `${size}px` }">
    <img :src="userIcon" alt="" class="user-avatar-icon" />
  </div>
</template>
