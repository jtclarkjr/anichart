import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Select from '../Select.vue'

const meta = {
  title: 'UI/Select',
  component: Select,
  args: {
    label: 'Sort anime',
    modelValue: 'popular',
    options: [
      { value: 'popular', label: 'Popular' },
      { value: 'trending', label: 'Trending' },
      { value: 'score', label: 'Top rated' }
    ]
  }
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Invalid: Story = { args: { error: 'Choose a sort order.' } }
export const Disabled: Story = { args: { disabled: true } }
