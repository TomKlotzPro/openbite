<template>
  <Fragment>
    <Banner v-if="isAuth && !user.confirmed">
      <p class="font-medium font-hind text-white">
        <span class="md:hidden">
          You need to confim your email!
        </span>
        <span class="hidden md:inline">
          Hey {{user.username}} 👋! You need to confirm your email.
        </span>
        <span class="block sm:ml-2 sm:inline-block">
          <a href="https://mail.google.com/mail/u/0/" target="_blank" class="text-white font-semibold underline">
            Access your Gmail <span aria-hidden="true">&rarr;</span>
          </a>
          You did not receive any email ?
          <a @click="resend" class="text-white font-semibold underline">
            Resend a confirmation email <span aria-hidden="true">&rarr;</span>
          </a>
        </span>
      </p>
    </Banner>
    <nav class="bg-white shadow z-10">
      <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex px-2 lg:px-0">
            <div class="flex-shrink-0 flex items-center">
              <nuxt-link to="/">
                <img
                  class="block lg:hidden h-8 w-auto"
                  src="~/assets/images/opentwk.svg"
                  alt="Openetwork"
                />
                <img
                  class="hidden lg:block h-8 w-auto"
                  src="~/assets/images/opentwk_w_name.svg"
                  alt="Openetwork"
                />
              </nuxt-link>
            </div>
            <template v-if="defaultNav">
              <div class="hidden lg:ml-6 lg:flex lg:space-x-8 font-hind">
                <CustomLink customLink url="/blogs">
                  Blogs
                </CustomLink>
                <CustomLink customLink url="/projects">
                  Projects
                </CustomLink>
                <CustomLink customLink url="/join">
                  Join us
                </CustomLink>
              </div>
            </template>
          </div>
          <template v-if="defaultNav">
            <Search />
          </template>
          <div class="flex items-center lg:hidden">
            <button
              @click="isMenu = !isMenu"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded="false"
            >
              <span class="sr-only">Open main menu</span>
              <svg
                class="h-6 w-6"
                :class="isMenu ? 'hidden' : 'block'"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                class="h-6 w-6"
                :class="isMenu ? 'block' : 'hidden'"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="hidden lg:ml-4 lg:flex lg:items-center">
            <div class=" space-x-3 lg:ml-4 lg:flex lg:items-center">
              <template v-if="!isAuth">
                <div class="flex-shrink-0">
                  <CustomLink customLink url="/signin" class="border-none">
                    Sign in
                  </CustomLink>
                </div>
                <div class="flex-shrink-0">
                  <CustomLink customLink url="/signup" class="border-none">
                    Sign up
                  </CustomLink>
                </div>
              </template>
              <template v-if="isAuth">
                <template v-if="defaultNav">
                  <div class="flex-shrink-0">
                    <span
                      class="lg:inline-flex lg:w-auto w-full px-3 py-2 text-nebula-500 items-center justify-center uppercase tracking-widest font-semibold text-xs"
                    >
                      Hi {{ user.username }}
                    </span>
                  </div>
                  <div class="flex-shrink-0">
                    <CustomLink
                      provide="block px-2 py-2 text-grey-500 items-center justify-center uppercase tracking-widest font-semibold text-xs hover:text-nebula-500"
                      @on-click="() => $router.push('/workspace')"
                      >Workspace</CustomLink
                    >
                  </div>
                </template>
                <template v-else>
                  <slot name="actionMenu"></slot>
                  <Button
                    v-if="exitLink"
                    :to="exitLink"
                    class="ml-2"
                    buttonWidth="40"
                    >Exit</Button
                  >
                </template>
              </template>
            </div>
            <template v-if="isAuth">
              <div class="ml-4 relative flex-shrink-0">
                <div>
                  <button
                    @click="isDropdown = !isDropdown"
                    class="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nebula-500"
                    id="user-menu"
                    aria-haspopup="true"
                  >
                    <span class="sr-only">Open user menu</span>
                    <img
                      class="h-8 w-8 rounded-full"
                      :src="user.avatar"
                      :alt="user.name"
                    />
                  </button>
                </div>
                <transition
                  enter-active-class="transition ease-out duration-100"
                  enter-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <div
                    v-show="isDropdown"
                    class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <CustomLink
                      provide="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      @on-click="logout"
                      >Log out</CustomLink
                    >
                  </div>
                </transition>
              </div>
            </template>
          </div>
        </div>
      </div>
      <template v-if="defaultNav">
        <div class="lg:hidden" :class="isMenu ? 'block' : 'hidden'">
          <template v-if="isAuth">
            <div class="pt-4 pb-3 border-t border-gray-200">
              <div class="flex items-center px-4">
                <div class="flex-shrink-0">
                  <img
                    class="h-10 w-10 rounded-full"
                    :src="user.avatar"
                    :alt="user.name"
                  />
                </div>
                <div class="ml-3">
                  <div class="text-base font-medium text-gray-800">
                    {{ user.name }}
                  </div>
                  <div class="text-sm font-medium text-gray-500">
                    {{ user.email }}
                  </div>
                </div>
              </div>
              <div class="mt-3 space-y-1 divide-y">
                <CustomLink defaultLink url="/projects">Projects</CustomLink>
                <CustomLink defaultLink url="/blogs">Blogs</CustomLink>
                <CustomLink defaultLink url="/join">Join Us</CustomLink>
                <CustomLink
                  defaultLink
                  provide=" "
                  @on-click="() => $router.push('/workspace')"
                  >Workspace</CustomLink
                >
                <CustomLink defaultLink event @on-click="logout"
                  >Log out</CustomLink
                >
              </div>
            </div>
          </template>
          <template v-else>
            <div class="pt-2 pb-3 space-y-1">
              <CustomLink defaultLink url="/about">About</CustomLink>
              <CustomLink defaultLink url="/blogs">Blogs</CustomLink>
              <CustomLink defaultLink url="/projects">Projects</CustomLink>
              <CustomLink defaultLink url="/join">Join Us</CustomLink>
            </div>
            <div class="pt-2 pb-3 border-t border-grey-200">
              <CustomLink defaultLink url="/signin">Sign in</CustomLink>
              <CustomLink defaultLink url="/signup">Sign up</CustomLink>
            </div>
          </template>
        </div>
      </template>
      <template v-else>
        <div class="lg:hidden" :class="isMenu ? 'block' : 'hidden'">
          <template v-if="isAuth">
            <div class="pt-4 pb-3 border-t border-gray-200">
              <div class="flex items-center px-4">
                <div class="flex-shrink-0">
                  <img
                    class="h-10 w-10 rounded-full"
                    :src="user.avatar"
                    :alt="user.name"
                  />
                </div>
                <div class="ml-3">
                  <div class="text-base font-medium text-gray-800">
                    {{ user.name }}
                  </div>
                  <div class="text-sm font-medium text-gray-500">
                    {{ user.email }}
                  </div>
                </div>
              </div>
              <div class="mt-3 space-y-1">
                <div class="px-4">
                  <slot name="actionMenu"></slot>
                </div>
                <div class="px-4 pt-2">
                  <Button
                    v-if="exitLink"
                    :to="exitLink"
                    class="mx-auto w-full"
                    buttonWidth="40"
                    >Exit</Button
                  >
                </div>
                <CustomLink defaultLink event @on-click="logout"
                  >Log out</CustomLink
                >
              </div>
            </div>
          </template>
        </div>
      </template>
    </nav>
  </Fragment>
</template>

<script>
import Search from "~/components/shared/Search";
import CustomLink from "~/components/CustomLink";
import LogoNode from "../../assets/images/opentwk.svg";
import Button from "./Button";
import Banner from "~/components/shared/Banner";
import { Fragment } from "vue-fragment";
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      isDropdown: false,
      isMenu: false,
      current: ""
    };
  },
  props: {
    defaultNav: {
      type: Boolean,
      required: false,
      default: false
    },
    exitLink: {
      type: String,
      required: false
    }
  },
  components: {
    Search,
    LogoNode,
    CustomLink,
    Button,
    Fragment
  },
  computed: {
    ...mapGetters({
      user: "auth/authUser",
      isAuth: "auth/isAuthenticated"
    })
  },
  methods: {
    logout() {
      this.$store
        .dispatch("auth/logout")
        .then(() => this.$router.push("/signin"));
    },
    resend() {
      this.$store
        .dispatch("auth/sendConfirmationEmail", { email: this.user.email})
        .then(() => {
          console.log("email resent")
          this.$toasted.global.on_success({
            message: "Email sent"
          })
        })
        .catch(() =>
          this.$toasted.global.on_error({
            message: "Wrong Email"
          })
        );
    }
  }
};
</script>

<style></style>
