import { Component } from '@angular/core';
import { Storage } from '@ng-native/expo/store';
import { render, waitFor } from '@ng-native/testing';
import { expect, it } from 'vitest';
import { OnboardingService } from './onboarding.service.ts';

// In a test Storage has no native store: every read resolves empty, so `ready` turns true.
// https://ng-native.com/packages/expo/storage#without-the-module

@Component({ selector: 'app-host', template: '' })
class Host {}

it('welcomes once the stored flag is read back, and never after finishing', async () => {
  const { componentRef } = await render(Host);
  const onboarding = componentRef.injector.get(OnboardingService);

  await waitFor(() => expect(onboarding.shouldWelcome()).toBe(true));
  onboarding.finish();

  expect(onboarding.shouldWelcome()).toBe(false);
});

it('does not welcome a device that has already seen Welcome', async () => {
  const { componentRef } = await render(Host);
  componentRef.injector.get(Storage).signal('welcomed', false).set(true);

  const onboarding = componentRef.injector.get(OnboardingService);

  await waitFor(() => expect(componentRef.injector.get(Storage).ready()).toBe(true));
  expect(onboarding.shouldWelcome()).toBe(false);
});
