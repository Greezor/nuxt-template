<template></template>

<script setup>
	definePageMeta({
		layout: false, // выключаем layout default.vue, чтобы был белый экран
	});

	const { signOut } = useAuth(); // импорт функции выхода из уч. записи

	onMounted(async () => { // после загрузки страницы делаем выход из учётки и редирект на главную
		await signOut({ redirect: false }); // выход
		return navigateTo('/'); // редирект
	});
</script>