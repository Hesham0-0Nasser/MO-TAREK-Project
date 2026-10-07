import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text as RNText, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useLang } from '../i18n';
import { theme, c } from '../theme';
import { Icon } from './Icon';

type Variant = keyof typeof theme.type;

/** Text with the right font for the active language. `mono` is for codes and always reads LTR. */
export function Text({ variant = 'body', mono, color = c.ink, weight, style, children, ...rest }: {
  variant?: Variant; mono?: boolean; color?: string; weight?: TextStyle['fontWeight']; style?: StyleProp<TextStyle>; children?: React.ReactNode; numberOfLines?: number; selectable?: boolean;
}) {
  const { font } = useLang();
  return (
    <RNText
      {...rest}
      style={[theme.type[variant] as TextStyle, { color, fontFamily: mono ? theme.font.mono : font }, weight ? { fontWeight: weight } : null, mono ? { writingDirection: 'ltr' } : null, style]}
      {...(mono ? ({ dir: 'ltr' } as object) : null)}
    >
      {children}
    </RNText>
  );
}

export function Button({ label, onPress, variant = 'primary', icon, disabled, loading, height = theme.size.button, style, fontSize }: {
  label: string; onPress?: () => void; variant?: 'primary' | 'secondary' | 'text' | 'danger'; icon?: string; disabled?: boolean; loading?: boolean; height?: number; style?: StyleProp<ViewStyle>; fontSize?: number;
}) {
  const fg = variant === 'primary' || variant === 'danger' ? c.onPrimary : variant === 'text' ? c.primary : c.ink;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        {
          height, borderRadius: theme.radius.md + 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 16,
          backgroundColor: variant === 'primary' ? c.primary : variant === 'danger' ? c.danger : variant === 'secondary' ? (pressed ? c.chipBg : c.surface) : 'transparent',
          borderWidth: variant === 'secondary' ? 1.5 : 0, borderColor: c.border,
          opacity: disabled ? 0.45 : pressed && (variant === 'primary' || variant === 'danger') ? 0.85 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        } as ViewStyle,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Icon name={icon} size={22} color={fg} /> : null}
      <Text variant="bodyLg" color={fg} style={{ fontSize: fontSize ?? (variant === 'primary' ? 18 : 17), textDecorationLine: variant === 'text' ? 'underline' : 'none' }}>{label}</Text>
    </Pressable>
  );
}

/** Round icon-only or small pill buttons (copy, paste, show/hide). */
export function SoftButton({ label, icon, onPress, color = c.primary, bg = c.primarySoft, height = 48 }: { label?: string; icon?: string; onPress?: () => void; color?: string; bg?: string; height?: number }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => ({ height, paddingHorizontal: 12, borderRadius: theme.radius.md - 2, backgroundColor: bg, flexDirection: 'row', alignItems: 'center', gap: 6, opacity: pressed ? 0.8 : 1, cursor: 'pointer' } as ViewStyle)}>
      {icon ? <Icon name={icon} size={20} color={color} /> : null}
      {label ? <Text variant="bodyLg" color={color} style={{ fontSize: 15 }}>{label}</Text> : null}
    </Pressable>
  );
}

export function Field({ label, error, children }: { label?: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      {label ? <Text variant="meta" color={c.text2} weight="600" style={{ fontSize: 15 }}>{label}</Text> : null}
      {children}
      {error ? <Text variant="meta" color={c.danger} style={{ fontSize: 15 }}>{error}</Text> : null}
    </View>
  );
}

export function Input({ value, onChangeText, placeholder, error, secure, mono, ltr, keyboardType, onSubmit, endAction, height = theme.size.input, fontSize = 18, disabled, autoFocus, multiline }: {
  value: string; onChangeText?: (v: string) => void; placeholder?: string; error?: boolean; secure?: boolean; mono?: boolean; ltr?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'number-pad'; onSubmit?: () => void; endAction?: React.ReactNode; height?: number; fontSize?: number; disabled?: boolean; autoFocus?: boolean; multiline?: boolean;
}) {
  const { font, rtl } = useLang();
  const [focused, setFocused] = useState(false);
  const forceLtr = ltr || mono;
  return (
    <View style={{
      minHeight: height, flexDirection: 'row', alignItems: 'center', backgroundColor: disabled ? c.chipBg : c.surface, borderRadius: theme.radius.md + 2,
      borderWidth: focused || (mono && value) ? 2 : 1.5, borderColor: error ? '#D92D20' : focused || (mono && value) ? c.primary : c.border, paddingStart: 16, paddingEnd: endAction ? 6 : 16,
    }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.placeholder}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        onSubmitEditing={onSubmit}
        editable={!disabled}
        autoFocus={autoFocus}
        multiline={multiline}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...(forceLtr ? ({ dir: 'ltr' } as object) : null)}
        style={[{
          flex: 1, minWidth: 0, height: multiline ? undefined : height - 4, minHeight: multiline ? 88 : undefined, color: c.ink, fontSize: mono ? 19 : fontSize, fontFamily: mono ? theme.font.mono : font,
          letterSpacing: mono ? 0.5 : 0, outlineStyle: 'none', borderWidth: 0, paddingVertical: multiline ? 12 : 0,
          textAlign: forceLtr ? (rtl && !mono ? 'right' : 'left') : 'auto',
        } as unknown as TextStyle]}
      />
      {endAction}
    </View>
  );
}

export function PasswordInput({ value, onChangeText, show, onToggle, error, onSubmit, showLabel, hideLabel }: {
  value: string; onChangeText: (v: string) => void; show: boolean; onToggle: () => void; error?: boolean; onSubmit?: () => void; showLabel: string; hideLabel: string;
}) {
  return (
    <Input
      value={value} onChangeText={onChangeText} secure={!show} error={error} onSubmit={onSubmit}
      endAction={
        <Pressable accessibilityRole="button" onPress={onToggle} style={{ height: 48, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6, cursor: 'pointer' } as ViewStyle}>
          <Icon name={show ? 'eyeOff' : 'eye'} size={22} color={c.text3} />
          <Text variant="body" color={c.text3} weight="600" style={{ fontSize: 15 }}>{show ? hideLabel : showLabel}</Text>
        </Pressable>
      }
    />
  );
}

export function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={{ height: 44, paddingHorizontal: 18, borderRadius: 22, borderWidth: 1.5, borderColor: selected ? c.primary : c.border, backgroundColor: selected ? c.primary : c.surface, justifyContent: 'center', cursor: 'pointer' } as ViewStyle}>
      <Text variant="bodyLg" color={selected ? '#fff' : c.text2} style={{ fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

export function Banner({ icon = 'bell', text, action }: { icon?: string; text: string; action?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 16, borderRadius: theme.radius.lg, backgroundColor: c.primarySoft }}>
      <Icon name={icon} size={24} color={c.primary} />
      <View style={{ flex: 1, gap: 10, alignItems: 'flex-start' }}>
        <Text style={{ lineHeight: 24 }}>{text}</Text>
        {action}
      </View>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.divider, borderRadius: theme.radius.xl, padding: 20 }, style]}>{children}</View>;
}

export function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: on }} onPress={onToggle} style={{ width: 52, height: 32, borderRadius: 16, backgroundColor: on ? c.primary : c.border, padding: 2, justifyContent: 'center', cursor: 'pointer' } as ViewStyle}>
      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', alignSelf: on ? 'flex-end' : 'flex-start' } as ViewStyle} />
    </Pressable>
  );
}

export function Segmented<T extends string>({ options, value, onChange, height = 48 }: { options: { value: T; label: string; font?: string }[]; value: T; onChange: (v: T) => void; height?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4, padding: 4, backgroundColor: c.chipBg, borderRadius: theme.radius.lg - 2 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} accessibilityRole="button" onPress={() => onChange(o.value)} style={{ flex: 1, height, borderRadius: 10, backgroundColor: on ? '#fff' : 'transparent', alignItems: 'center', justifyContent: 'center', boxShadow: on ? '0 1px 3px rgba(16,24,40,0.12)' : 'none', cursor: 'pointer' } as ViewStyle}>
            <Text variant="bodyLg" color={on ? c.ink : c.text3} style={[{ fontSize: 16 }, o.font ? { fontFamily: o.font } : null]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
