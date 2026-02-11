<script>
  import { marked } from 'marked';
  import DOMPurify from 'isomorphic-dompurify';

  let { content = '', class: className = '' } = $props();
  let htmlContent = $derived(DOMPurify.sanitize(marked.parse(content)));
</script>

<div
  class="prose prose-sm md:prose-base focus-visible:ring-primary max-w-none transition-all outline-none focus-visible:ring-2 {className}"
  aria-label="Markdown content"
>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html htmlContent}
</div>
