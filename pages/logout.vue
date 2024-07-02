<template></template>

<script setup>
	definePageMeta({
		layout: false,
	});

	const { signOut } = useAuth();

	onMounted(async () => {
		await signOut({ redirect: false });
		return navigateTo('/');
	});
</script>