import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { Button, Input, Select, Spinner } from '@jtclarkjr/component-library-vue'
import type {
  ButtonSize,
  ButtonVariant,
  ChoiceOption,
  InputParts,
  InputType,
  SpinnerSize
} from '@jtclarkjr/component-library-vue'

type SortValue = 'popular' | 'score'

const selectOptions = [
  { value: 'popular', label: 'Popular' },
  { value: 'score', label: 'Score' }
] satisfies ChoiceOption<SortValue>[]

describe('component-library consumer contracts', () => {
  it('renders native button variants, sizes, loading state, and loader slots', () => {
    const variant: ButtonVariant = 'surface'
    const size: ButtonSize = 'icon'
    const wrapper = mount(Button, {
      props: { loading: true, variant, size },
      slots: {
        default: 'Save',
        loader: '<span data-testid="loader">Saving</span>'
      }
    })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['clv-button', 'clv-button--surface', 'clv-button--icon'])
    )
    expect(wrapper.attributes()).toMatchObject({
      'aria-busy': 'true',
      'data-clv-component': 'button',
      'data-loading': '',
      'data-part': 'root',
      'data-size': 'icon',
      'data-variant': 'surface'
    })
    expect(wrapper.attributes()).toHaveProperty('disabled')
    expect(wrapper.get('[data-testid="loader"]').text()).toBe('Saving')
    expect(wrapper.text()).toContain('Save')
  })

  it('blocks activation for unavailable polymorphic buttons', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Button, {
      props: { as: 'a', disabled: true },
      attrs: { href: '/anime', onClick },
      slots: { default: 'Anime' }
    })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes()).toMatchObject({
      'aria-disabled': 'true',
      tabindex: '-1'
    })

    await wrapper.trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('forwards native input attributes through parts and clears models before clear events', async () => {
    const eventOrder: string[] = []
    const type: InputType = 'search'
    const parts = {
      input: {
        autocomplete: 'off',
        'data-testid': 'native-input'
      }
    } satisfies InputParts
    const wrapper = mount(Input, {
      props: {
        label: 'Search',
        error: 'Required',
        clearable: true,
        modelValue: 'Cowboy Bebop',
        type,
        parts,
        'onUpdate:modelValue': (value: string) => eventOrder.push(`model:${value}`),
        onClear: () => eventOrder.push('clear')
      },
      slots: { leading: '<span data-leading>⌕</span>' }
    })
    const input = wrapper.get('input')

    expect(wrapper.attributes()).toMatchObject({
      'data-clv-component': 'input',
      'data-part': 'root'
    })
    expect(wrapper.get('label').attributes('for')).toBe(input.attributes('id'))
    expect(input.attributes()).toMatchObject({
      'aria-invalid': 'true',
      autocomplete: 'off',
      'data-part': 'input',
      'data-testid': 'native-input',
      type: 'search'
    })
    expect(wrapper.find('[data-leading]').exists()).toBe(true)

    await wrapper.get('button[aria-label="Clear input"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['']])
    expect(wrapper.emitted('clear')).toEqual([[]])
    expect(eventOrder).toEqual(['model:', 'clear'])
  })

  it('keeps typed select options coupled to the model value', async () => {
    const wrapper = mount(Select, {
      props: {
        label: 'Sort',
        modelValue: 'popular' as SortValue,
        options: selectOptions,
        parts: { control: { 'data-testid': 'select-control' } }
      }
    })

    expect(wrapper.attributes()).toMatchObject({
      'data-clv-component': 'select',
      'data-part': 'root'
    })
    expect(wrapper.get('[role="combobox"]').attributes()).toMatchObject({
      'data-part': 'control',
      'data-testid': 'select-control'
    })
    expect(wrapper.get('[role="combobox"]').text()).toContain('Popular')

    await wrapper.setProps({ modelValue: 'score' satisfies SortValue })

    expect(wrapper.get('[role="combobox"]').text()).toContain('Score')
    expect(wrapper.props('options')).toEqual(selectOptions)
  })

  it('supports xl and decorative spinner accessibility semantics', () => {
    const size: SpinnerSize = 'xl'
    const labelled = mount(Spinner, { props: { label: 'Loading results', size } })
    const decorative = mount(Spinner, { props: { decorative: true } })

    expect(labelled.classes()).toEqual(expect.arrayContaining(['clv-spinner', 'clv-spinner--xl']))
    expect(labelled.attributes()).toMatchObject({
      role: 'status',
      'aria-label': 'Loading results',
      'data-clv-component': 'spinner',
      'data-part': 'root',
      'data-size': 'xl'
    })
    expect(decorative.attributes('aria-hidden')).toBe('true')
    expect(decorative.attributes('role')).toBeUndefined()
  })
})
