import { Suspense } from "react"
import { CustomersClient } from "./client"

export default function CustomersPage() {
  return (
    <Suspense fallback={null}>
      <CustomersClient />
    </Suspense>
  )
}
