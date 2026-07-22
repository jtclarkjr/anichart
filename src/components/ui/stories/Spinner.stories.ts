import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Spinner from '../Spinner.vue'

const meta = {
  title: 'UI/Spinner',
  component: Spinner,
  args: { label: 'Loading content', size: 'md' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] }
  }
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Small: Story = { args: { size: 'sm' } }
export const Large: Story = { args: { size: 'xl' } }
export const Decorative: Story = { args: { decorative: true } }
