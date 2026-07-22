import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Button from '../Button.vue'

const meta = {
  title: 'UI/Button',
  component: Button,
  args: { default: 'Continue', variant: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'surface', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'icon'] }
  },
  render: (args) => ({
    components: { Button },
    setup: () => ({ args }),
    template: '<Button v-bind="args">{{ args.default }}</Button>'
  })
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
export const Surface: Story = { args: { variant: 'surface' } }
export const Loading: Story = { args: { loading: true, default: 'Saving' } }
export const Disabled: Story = { args: { disabled: true } }
export const Danger: Story = { args: { variant: 'danger', default: 'Delete' } }
export const Anchor: Story = {
  args: { as: 'a', variant: 'surface', default: 'Open AniList' }
}
