import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Select from '../Select.vue'

const meta = {
  title: 'UI/Select',
  component: Select,
  args: { label: 'Sort anime', modelValue: 'popular' },
  render: (args) => ({
    components: { Select },
    setup: () => ({ args }),
    template: `<Select v-bind="args">
      <option value="popular">Popular</option>
      <option value="trending">Trending</option>
      <option value="score">Top rated</option>
    </Select>`
  })
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Invalid: Story = { args: { error: 'Choose a sort order.' } }
export const Disabled: Story = { args: { disabled: true } }
