<script lang="ts">
  /** @type {import('./$types').PageProps} */
  let { data } = $props();
</script>

<div class="p-4">
  <h1 class="text-lg font-semibold">Looking for someone to talk to?</h1>
  <h2 class="mb-4 text-2xl font-bold">Choose Your Buddy</h2>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each data.personas as persona (persona.id)}
      <a href={`/chat/${persona.id}`} class="no-underline block h-full">
        <div
          class="card bg-base-100 shadow-xl transition-shadow hover:shadow-2xl h-full"
        >
          <div class="card-body">
            <div class="flex items-center gap-4">
              <div class="avatar">
                <div class="w-16 rounded-full">
                  <img
                    src={persona.avatar}
                    alt={persona.name}
                    class="h-16 w-16"
                  />
                </div>
              </div>
              <h2 class="card-title">{persona.name}</h2>
            </div>
            <p>{persona.description}</p>
          </div>
        </div>
      </a>
    {/each}
  </div>
</div>
