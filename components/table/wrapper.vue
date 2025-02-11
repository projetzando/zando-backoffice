<template>
    <div class="bg-white shadow-sm border border-gray-100 rounded-lg">
        <div class="bg-white border rounded-tl-lg rounded-tr-lg">
            <slot name="header" />
        </div>

        <div>
            <slot name="content" />

            <div class="flex justify-between gap-x-2  p-2 border-t border-t-gray-200 items-center">
                <slot name="footer" />
            </div>
        </div>
    </div>
</template>