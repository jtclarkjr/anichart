import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Button from '../ui/Button.vue'
import Input from '../ui/Input.vue'
import Select from '../ui/Select.vue'
import Spinner from '../ui/Spinner.vue'

describe('UI primitives', () => {
  it('renders button variants and loading semantics', () => {
    const wrapper = mount(Button, {
      props: { loading: true, variant: 'surface', size: 'lg' },
      slots: { default: 'Save' }
    })

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['ui-button--surface', 'ui-button--lg'])
    )
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes()).toHaveProperty('disabled')
    expect(wrapper.text()).toContain('Save')
  })

  it('supports disabled polymorphic buttons without firing clicks', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Button, {
      props: { as: 'a', disabled: true },
      attrs: { href: '/anime', onClick },
      slots: { default: 'Anime' }
    })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.attributes('tabindex')).toBe('-1')

    await wrapper.trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('connects input labels and errors while supporting clearable models', async () => {
    const wrapper = mount(Input, {
      props: {
        label: 'Search',
        error: 'Required',
        clearable: true,
        modelValue: 'Cowboy Bebop'
      },
      slots: { leading: '<span data-leading>⌕</span>' }
    })
    const input = wrapper.get('input')

    expect(wrapper.get('label').attributes('for')).toBe(input.attributes('id'))
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('[data-leading]').exists()).toBe(true)

    await wrapper.get('button[aria-label="Clear input"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['']])
    expect(wrapper.emitted('clear')).toEqual([[]])
  })

  it('renders slotted select options and updates its model', async () => {
    const wrapper = mount(Select, {
      props: { label: 'Sort', modelValue: 'popular' },
      slots: {
        default: '<option value="popular">Popular</option><option value="score">Score</option>'
      }
    })

    await wrapper.get('select').setValue('score')

    expect(wrapper.get('label').attributes('for')).toBe(wrapper.get('select').attributes('id'))
    expect(wrapper.emitted('update:modelValue')).toEqual([['score']])
  })

  it('switches spinner accessibility semantics for decorative use', () => {
    const labelled = mount(Spinner, { props: { label: 'Loading results', size: 'lg' } })
    const decorative = mount(Spinner, { props: { decorative: true } })

    expect(labelled.attributes()).toMatchObject({
      role: 'status',
      'aria-label': 'Loading results'
    })
    expect(decorative.attributes('aria-hidden')).toBe('true')
    expect(decorative.attributes('role')).toBeUndefined()
  })
})
