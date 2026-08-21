export default function StatCard({ icon: Icon, value, label }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon className="size-5" />
            </div>

            <div>
                <p className="text-xl font-bold leading-none">{value ?? 0}</p>

                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}
