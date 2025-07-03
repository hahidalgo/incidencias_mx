import { MovimientosClient } from "./components/movimientos-client";

const MovimientosPage = () => {
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <MovimientosClient />
            </div>
        </div>
    );
};

export default MovimientosPage;