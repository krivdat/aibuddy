<script>
  import { enhance } from '$app/forms';
  import { onMount, tick } from 'svelte';
  import DOMPurify from 'dompurify';
  import Markdown from '$lib/Markdown.svelte';

  let { data, form } = $props();
  let showConfirm = $state(false);

  let messages = $state(data.messages || []);
  $effect(() => {
    messages = data.messages || [];
  });

  let loading = $state(false);
  let userInput = $state('');
  let chatContainer = $state();
  let inputElement = $state();

  function isDesktop() {
    if (typeof window === 'undefined') return false;
    // Check for touch screen capability (mobile devices typically have touch)
    const isTouchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) return true;
    // Fallback to screen width if touch detection is inconclusive
    return window.screen.width >= 1024;
  }

  $effect(() => {
    if (!chatContainer) return;
    messages; // dependency
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
  });

  onMount(() => {
    if (isDesktop()) {
      inputElement?.focus();
    }
  });

  function handleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      showConfirm = false;
    }
  }
</script>

<div class="mx-auto flex h-dvh max-w-4xl flex-col">
  <div
    class="bg-base-100 border-base-content/30 sticky top-0 z-10 flex items-center border-b p-2 md:p-4"
  >
    <a href="/" class="btn btn-ghost btn-circle mr-2" aria-label="Back to home">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="h-6 w-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
        />
      </svg>
    </a>
    <div class="avatar mr-4">
      <div class="w-10 rounded-full">
        <img src={data.persona.avatar} alt={data.persona.name} />
      </div>
    </div>
    <h1 class="text-base font-bold md:text-lg">{data.persona.name}</h1>
    <div class="ml-auto">
      <button
        class="btn btn-ghost btn-circle"
        onclick={() => (showConfirm = true)}
        aria-label="Clear chat history"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-6 w-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
          />
        </svg>
      </button>
    </div>
  </div>

  {#if showConfirm}
    <form
      method="POST"
      action="?/clear"
      use:enhance={() => {
        return async ({ result, update }) => {
          showConfirm = false;
          if (result.type === 'success') {
            console.log('Chat history cleared successfully');
            await update();
          } else if (result.type === 'failure') {
            console.error('Failed to clear chat history:', result.data);
          }
        };
      }}
    >
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="text-lg font-bold">Clear Chat History</h3>
          <p class="py-4">
            Are you sure you want to clear the entire chat history? This action
            cannot be undone.
          </p>
          <div class="modal-action">
            <button
              type="button"
              class="btn"
              onclick={() => (showConfirm = false)}>Cancel</button
            >
            <button type="submit" class="btn btn-error">Clear Chat</button>
          </div>
        </div>
        <div
          class="modal-backdrop"
          onclick={() => (showConfirm = false)}
          onkeydown={handleKeydown}
          role="button"
          tabindex="0"
        ></div>
      </div>
    </form>
  {/if}

  <div bind:this={chatContainer} class="flex-grow overflow-y-auto p-2 md:p-4">
    {#each messages as message, i (i)}
      <div class="chat {message.role === 'user' ? 'chat-end' : 'chat-start'}">
        <div
          class="chat-bubble my-1 {message.role === 'user'
            ? 'chat-bubble-primary text-white'
            : ''} max-w-[98%] px-2 py-1 text-sm md:px-4 md:text-base"
        >
          <Markdown
            content={message.content}
            class={message.role === 'user' ? 'prose-invert text-white' : ''}
          />
        </div>
      </div>
    {/each}
    {#if loading}
      <div class="chat chat-start">
        <div class="chat-bubble my-1 px-2 py-1 text-sm md:px-4 md:text-base">
          Buddy is typing...
        </div>
      </div>
    {/if}
  </div>

  <div
    class="bg-base-100 border-base-content/30 sticky bottom-0 z-10 border-t p-4"
  >
    <form
      method="POST"
      action="?/send"
      use:enhance={() => {
        loading = true;
        const sanitizedUserInput = DOMPurify.sanitize(userInput.trim());
        messages = [...messages, { role: 'user', content: sanitizedUserInput }];
        userInput = '';

        return async ({ result }) => {
          loading = false;
          if (result.type === 'success') {
            messages = [...messages, result.data.answer];
            await tick();
            if (isDesktop()) {
              inputElement?.focus();
            }
          } else {
            form.error = result.error;
          }
        };
      }}
    >
      <div class="join w-full">
        <input
          type="text"
          bind:this={inputElement}
          name="userInput"
          bind:value={userInput}
          disabled={loading}
          class="input input-bordered join-item focus:border-primary/40 w-full focus:outline-none"
          placeholder="Type a message"
        />
        <button type="submit" class="btn btn-primary join-item">Send</button>
      </div>
    </form>
  </div>
</div>
{#if form?.error}
  <div class="alert alert-error mt-4">
    <span>{form.error}</span>
  </div>
{:else if form?.data?.error}
  <div class="alert alert-error mt-4">
    <span>{form.data.error}</span>
  </div>
{/if}
